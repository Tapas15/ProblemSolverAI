import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-password'
  }
});

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "questionpro-ai-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days by default
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, name, email } = req.body;
      
      if (!username || !password || !name || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        name,
        email,
        apiKey: null,
        aiProvider: null
      });

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });
      
      // Check if rememberMe is set to true and adjust session expiration
      if (req.body.rememberMe) {
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 14; // 14 days
      } else {
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24; // 1 day (default)
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
  
  app.patch("/api/user/ai-settings", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { apiKey, aiProvider } = req.body;
      const userId = (req.user as SelectUser).id;
      
      const updatedUser = await storage.updateUser(userId, { apiKey, aiProvider });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  // Request password reset
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // For security reasons, return success even if the email doesn't exist
        return res.status(200).json({ message: "If the email exists, a password reset link has been sent" });
      }
      
      // Generate a unique token
      const token = uuidv4();
      
      // Token expires in 1 hour
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      
      // Save token and expiry to user record
      await storage.updateUser(user.id, {
        resetPasswordToken: token,
        resetPasswordExpires: expiresAt
      });
      
      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${token}`;
      
      // Send email
      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER || 'no-reply@questionpro-ai.app',
          to: user.email,
          subject: 'QuestionPro AI - Password Reset',
          html: `
            <h1>Reset your password</h1>
            <p>Hello ${user.name},</p>
            <p>You recently requested to reset your password for your QuestionPro AI account. Click the button below to reset it:</p>
            <p>
              <a href="${resetUrl}" style="padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
            <p>This password reset link is only valid for the next hour.</p>
          `
        });
        
        res.status(200).json({ message: "If the email exists, a password reset link has been sent" });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        res.status(500).json({ message: "Failed to send password reset email. Please try again later." });
      }
    } catch (error) {
      next(error);
    }
  });

  // Verify reset token
  app.get("/api/verify-reset-token/:token", async (req, res, next) => {
    try {
      const { token } = req.params;
      
      // Find user with this token and check if it's still valid
      const users = await storage.getAllUsers();
      const user = users.find(u => 
        u.resetPasswordToken === token && 
        u.resetPasswordExpires !== null && 
        new Date(u.resetPasswordExpires) > new Date()
      );
      
      if (!user) {
        return res.status(400).json({ valid: false, message: "Password reset token is invalid or has expired" });
      }
      
      res.json({ valid: true });
    } catch (error) {
      next(error);
    }
  });

  // Reset password with token
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      
      // Find user with this token and check if it's still valid
      const users = await storage.getAllUsers();
      const user = users.find(u => 
        u.resetPasswordToken === token && 
        u.resetPasswordExpires !== null && 
        new Date(u.resetPasswordExpires) > new Date()
      );
      
      if (!user) {
        return res.status(400).json({ message: "Password reset token is invalid or has expired" });
      }
      
      // Update the user's password
      const hashedPassword = await hashPassword(password);
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      next(error);
    }
  });
}
