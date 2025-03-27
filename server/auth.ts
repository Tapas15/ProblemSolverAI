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

// Create a reusable transporter for sending emails
const createTransporter = () => {
  // For production, you would use real SMTP credentials
  // For testing/development, we'll use a test account or ethereal
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Function to send password reset email
async function sendPasswordResetEmail(email: string, resetToken: string, username: string) {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/auth/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Framework Pro" <noreply@frameworkpro.app>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Framework Pro Password Reset</h2>
        <p>Hello ${username},</p>
        <p>You recently requested to reset your password. Please click the link below to reset it:</p>
        <p><a href="${resetUrl}" style="padding: 10px 15px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
        <p>Regards,<br>The Framework Pro Team</p>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Function to send username recovery email
async function sendUsernameRecoveryEmail(email: string, username: string) {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Framework Pro" <noreply@frameworkpro.app>',
      to: email,
      subject: 'Username Recovery',
      html: `
        <h2>Framework Pro Username Recovery</h2>
        <p>Hello,</p>
        <p>You recently requested to recover your username. Your username is:</p>
        <p style="font-size: 18px; font-weight: bold; margin: 15px 0; padding: 10px; background-color: #f0f0f0; border-radius: 5px; text-align: center;">${username}</p>
        <p>You can now use this username to log in to your account.</p>
        <p>If you did not request this recovery, please contact support immediately.</p>
        <p>Regards,<br>The Framework Pro Team</p>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending username recovery email:', error);
    return false;
  }
}

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

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "framework-pro-secret",
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
        // Check if input is an email (contains @)
        let user;
        if (username.includes('@')) {
          user = await storage.getUserByEmail(username);
        } else {
          user = await storage.getUserByUsername(username);
        }
        
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
  
  // Forgot Password - Request password reset
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal that the email doesn't exist for security reasons
        return res.status(200).json({ message: "Password reset email sent if the email exists" });
      }
      
      // Generate a reset token
      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Update user with reset token and expiry
      await storage.updateUser(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      });
      
      // Send password reset email
      const emailSent = await sendPasswordResetEmail(email, resetToken, user.username);
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send password reset email" });
      }
      
      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      next(error);
    }
  });
  
  // Reset Password - Verify token and set new password
  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      // Find user with the reset token
      // We need to add a method to get a user by reset token
      const users = await storage.getAllUsers();
      const user = users.find(u => 
        u.resetPasswordToken === token && 
        u.resetPasswordExpires && 
        new Date(u.resetPasswordExpires) > new Date()
      );
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Update user with new password and clear reset token
      await storage.updateUser(user.id, {
        password: await hashPassword(newPassword),
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
      
      res.status(200).json({ message: "Password reset successful. You can now log in with your new password." });
    } catch (error) {
      next(error);
    }
  });
  
  // Forgot Username - Request username recovery
  app.post("/api/forgot-username", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal that the email doesn't exist for security reasons
        return res.status(200).json({ message: "Username recovery email sent if the email exists" });
      }
      
      // Send username recovery email
      const emailSent = await sendUsernameRecoveryEmail(email, user.username);
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send username recovery email" });
      }
      
      res.status(200).json({ message: "Username recovery email sent" });
    } catch (error) {
      next(error);
    }
  });
  
  // Legacy route - will be removed later
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
}
