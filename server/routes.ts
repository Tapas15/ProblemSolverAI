import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertQuizSchema, insertQuizAttemptSchema,
  insertXapiStatementSchema, insertLrsConfigurationSchema,
  XapiStatement,
  insertExerciseSchema, insertExerciseSubmissionSchema,
  Exercise, ExerciseSubmission,
  insertCertificateSchema, Certificate
} from "@shared/schema";
import { WebSocketServer, WebSocket } from 'ws';
import { xapiService } from "./services/xapi-service";
import { scormService } from "./services/scorm-service";
import path from "path";
import fs from "fs";
import multer from "multer";
import * as tar from "tar";
import { createGunzip } from "node:zlib";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { 
  cache, cacheData, getCachedData, invalidateCache, 
  invalidateRelatedCaches, CACHE_KEYS, cachingMiddleware, 
  addCacheHeaders, invalidateCachesByPattern 
} from "./cache";

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Add caching middleware
  app.use(cachingMiddleware);
  
  // Add cache headers for static assets
  app.use(addCacheHeaders);
  
  // Serve static files from the server/public directory
  app.use('/api/static', express.static(path.join(process.cwd(), 'server/public')));
  
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'uploads', req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });
  
  // Set up authentication routes
  setupAuth(app);
  
  // Upload avatar
  app.post("/api/user/avatar", upload.single('avatar'), async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await storage.updateUser(req.user.id, { avatarUrl });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ avatarUrl });
    } catch (error) {
      next(error);
    }
  });
  
  // Upload founder image
  app.post("/api/founder/image", upload.single('founderImage'), async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      // Check if the authenticated user is an admin or has appropriate permissions
      // This is a simple check to make sure only authorized users can update the founder image
      // You might want to implement more sophisticated permission checks
      if (req.user.role !== 'admin' && req.user.username !== 'Manas') {
        return res.status(403).json({ message: "Permission denied" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Create public/images directory if it doesn't exist
      const imagesDir = path.join(process.cwd(), 'public', 'images');
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      // Copy the uploaded file to the public/images directory with the name 'founder.jpg'
      const founderImagePath = path.join(imagesDir, 'founder.jpg');
      
      // Read the uploaded file and write it to the destination
      fs.copyFileSync(
        path.join(process.cwd(), 'uploads', req.file.filename),
        founderImagePath
      );

      // Return success response
      res.json({ 
        message: "Founder image updated successfully", 
        imageUrl: "/images/founder.jpg"
      });
    } catch (error) {
      console.error('Error updating founder image:', error);
      next(error);
    }
  });

  // Export user data
  app.get("/api/user/export", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      // Get the user's basic information (without password)
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive data
      const { password, ...userInfo } = user;
      
      // Get user's progress data
      const progressData = await storage.getUserProgress(req.user.id);
      
      // Get user's quiz attempts
      const quizAttempts = await storage.getUserQuizAttempts(req.user.id);
      
      // Compile all data
      const userData = {
        userInfo,
        progressData,
        quizAttempts,
        exportedAt: new Date().toISOString()
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(userData, null, 2);
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="user-data-export-${new Date().toISOString().split('T')[0]}.json"`);
      res.setHeader('Content-Type', 'application/json');
      
      // Send the data
      res.send(jsonData);
    } catch (error) {
      next(error);
    }
  });

  // Update user profile
  // Legacy PATCH endpoint for backward compatibility
  app.patch("/api/user/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const updateSchema = z.object({
        name: z.string().optional(),
        username: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        bio: z.string().optional()
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user.id, validatedData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  // New POST endpoint for profile updates
  app.post("/api/user/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const updateSchema = z.object({
        name: z.string().optional(),
        username: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        bio: z.string().optional()
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user.id, validatedData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  // 2FA routes
  app.post("/api/user/2fa/setup", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      // Import the 2FA service
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      
      // Generate a secret
      const { secret, otpauth_url } = twoFactorAuthService.generateSecret(req.user.username);
      
      // Generate QR code
      const qrCode = await twoFactorAuthService.generateQrCode(otpauth_url);
      
      // Store the secret temporarily (not in the database yet, only in the session)
      if (!req.session.twoFactorSetup) {
        req.session.twoFactorSetup = {};
      }
      req.session.twoFactorSetup.secret = secret;
      
      res.json({
        secret,
        qrCode
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/user/2fa/verify", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      // Get the secret from the session
      const secret = req.session.twoFactorSetup?.secret;
      
      if (!secret) {
        return res.status(400).json({ message: "2FA setup not initiated" });
      }
      
      // Import the 2FA service
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      
      // Verify the token
      const isValid = twoFactorAuthService.verifyToken(token, secret);
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid token" });
      }
      
      // If valid, enable 2FA for the user
      const updatedUser = await twoFactorAuthService.enableTwoFactor(req.user.id, secret);
      
      // Clear the setup session
      delete req.session.twoFactorSetup;
      
      // Generate backup codes
      const backupCodes = JSON.parse(updatedUser.twoFactorBackupCodes || '[]');
      
      // Return success with the updated user (minus password)
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Update user in session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        res.status(200).json({
          message: "2FA enabled successfully",
          user: userWithoutPassword,
          backupCodes
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/user/2fa/disable", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      // Check current password for additional security
      const { currentPassword, token } = req.body;
      
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      
      // Get the user with password
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // If 2FA is enabled, verify the token
      if (user.twoFactorEnabled && !token) {
        return res.status(400).json({ message: "Token is required to disable 2FA" });
      }
      
      // Import the 2FA service
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      
      if (user.twoFactorEnabled && token && user.twoFactorSecret) {
        // Verify the token
        const isValid = twoFactorAuthService.verifyToken(token, user.twoFactorSecret);
        
        if (!isValid) {
          return res.status(400).json({ message: "Invalid token" });
        }
      }
      
      // Disable 2FA
      const updatedUser = await twoFactorAuthService.disableTwoFactor(req.user.id);
      
      // Return success with the updated user (minus password)
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Update user in session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        res.status(200).json({
          message: "2FA disabled successfully",
          user: userWithoutPassword
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/user/2fa/backup", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      // Get the backup code from the request
      const { backupCode } = req.body;
      
      if (!backupCode) {
        return res.status(400).json({ message: "Backup code is required" });
      }
      
      // Get the user to check 2FA status
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      if (!user.twoFactorEnabled || !user.twoFactorBackupCodes) {
        return res.status(400).json({ message: "2FA is not enabled or no backup codes available" });
      }
      
      // Import the 2FA service
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      
      // Verify the backup code
      const { isValid, updatedCodes } = twoFactorAuthService.verifyBackupCode(
        backupCode,
        user.twoFactorBackupCodes
      );
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid backup code" });
      }
      
      // Update the user with the remaining backup codes
      const updatedUser = await storage.updateUser(req.user.id, {
        twoFactorBackupCodes: JSON.stringify(updatedCodes)
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Failed to update user" });
      }
      
      // Return success
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Update user in session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        res.status(200).json({
          message: "Backup code verified successfully",
          user: userWithoutPassword
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/user/2fa/generate-backup-codes", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      // Get the token from the request
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      // Get the user to check 2FA status
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        return res.status(400).json({ message: "2FA is not enabled" });
      }
      
      // Import the 2FA service
      const { twoFactorAuthService } = await import('./services/two-factor-auth-service');
      
      // Verify the token
      const isValid = twoFactorAuthService.verifyToken(token, user.twoFactorSecret);
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid token" });
      }
      
      // Generate new backup codes
      const backupCodes = twoFactorAuthService.generateBackupCodes();
      
      // Update the user with the new backup codes
      const updatedUser = await storage.updateUser(req.user.id, {
        twoFactorBackupCodes: JSON.stringify(backupCodes)
      });
      
      // Return success
      res.status(200).json({
        message: "New backup codes generated successfully",
        backupCodes
      });
    } catch (error) {
      next(error);
    }
  });
  
  // User settings routes
  
  // Update user password (POST endpoint - new API)
  app.post("/api/user/password", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const updateSchema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Get the user with password
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(validatedData.currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(validatedData.newPassword);
      
      // Update password
      const updatedUser = await storage.updateUser(req.user.id, { password: hashedPassword });
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Update user password (PATCH endpoint - legacy API)
  app.patch("/api/user/password", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const updateSchema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Get the user with password
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(validatedData.currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(validatedData.newPassword);
      
      // Update password
      const updatedUser = await storage.updateUser(req.user.id, { password: hashedPassword });
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  });
  
  // Update user privacy settings (POST endpoint - new API)
  app.post("/api/user/privacy", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const updateSchema = z.object({
        allowAnalytics: z.boolean().optional(),
        publicProfile: z.boolean().optional(), 
        allowPersonalization: z.boolean().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Store privacy settings in userPreferences field as JSON
      let userPreferences = {};
      
      // Get existing preferences if they exist
      if (req.user.userPreferences) {
        try {
          userPreferences = typeof req.user.userPreferences === 'string' 
            ? JSON.parse(req.user.userPreferences) 
            : req.user.userPreferences;
        } catch (e) {
          console.error("Failed to parse user preferences:", e);
        }
      }
      
      // Update preferences with new values
      const updatedPreferences = {
        ...userPreferences,
        privacy: {
          ...((userPreferences as any)?.privacy || {}),
          ...validatedData
        }
      };
      
      // Update user with new preferences
      const updatedUser = await storage.updateUser(req.user.id, { 
        userPreferences: JSON.stringify(updatedPreferences) 
      });
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Update user in session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        res.status(200).json({ 
          message: "Privacy settings updated successfully",
          user: userWithoutPassword
        });
      });
    } catch (error) {
      next(error);
    }
  });

  // Update user privacy settings (PATCH endpoint - legacy API)
  app.patch("/api/user/privacy", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const updateSchema = z.object({
        allowAnalytics: z.boolean().optional(),
        publicProfile: z.boolean().optional(), 
        allowPersonalization: z.boolean().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Store privacy settings in userPreferences field as JSON
      let userPreferences = {};
      
      // Get existing preferences if they exist
      if (req.user.userPreferences) {
        try {
          userPreferences = typeof req.user.userPreferences === 'string' 
            ? JSON.parse(req.user.userPreferences) 
            : req.user.userPreferences;
        } catch (e) {
          console.error("Failed to parse user preferences:", e);
        }
      }
      
      // Update preferences with new values
      const updatedPreferences = {
        ...userPreferences,
        privacy: {
          ...((userPreferences as any)?.privacy || {}),
          ...validatedData
        }
      };
      
      // Update user with new preferences
      const updatedUser = await storage.updateUser(req.user.id, { 
        userPreferences: JSON.stringify(updatedPreferences) 
      });
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Update user in session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        res.status(200).json({ 
          message: "Privacy settings updated successfully",
          user: userWithoutPassword
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Update user notification settings - Legacy PATCH endpoint
  app.patch("/api/user/notifications", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const updateSchema = z.object({
        learningReminders: z.boolean().optional(),
        frameworkUpdates: z.boolean().optional(),
        quizResults: z.boolean().optional(),
        productUpdates: z.boolean().optional(),
        emailFrequency: z.enum(['immediately', 'daily', 'weekly', 'none']).optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Store notification settings in userPreferences field as JSON
      let userPreferences = {};
      
      // Get existing preferences if they exist
      if (req.user.userPreferences) {
        try {
          userPreferences = typeof req.user.userPreferences === 'string' 
            ? JSON.parse(req.user.userPreferences) 
            : req.user.userPreferences;
        } catch (e) {
          console.error("Failed to parse user preferences:", e);
        }
      }
      
      // Update preferences with new values
      const updatedPreferences = {
        ...userPreferences,
        notifications: {
          ...((userPreferences as any)?.notifications || {}),
          ...validatedData
        }
      };
      
      // Update user with new preferences
      const updatedUser = await storage.updateUser(req.user.id, { 
        userPreferences: JSON.stringify(updatedPreferences) 
      });
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Update user in session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        res.status(200).json({ 
          message: "Notification settings updated successfully",
          user: userWithoutPassword
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  // New POST endpoint for notification settings
  app.post("/api/user/notifications", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const updateSchema = z.object({
        learningReminders: z.boolean().optional(),
        frameworkUpdates: z.boolean().optional(),
        quizResults: z.boolean().optional(),
        productUpdates: z.boolean().optional(),
        emailFrequency: z.enum(['immediately', 'daily', 'weekly', 'none']).optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Store notification settings in userPreferences field as JSON
      let userPreferences = {};
      
      // Get existing preferences if they exist
      if (req.user.userPreferences) {
        try {
          userPreferences = typeof req.user.userPreferences === 'string' 
            ? JSON.parse(req.user.userPreferences) 
            : req.user.userPreferences;
        } catch (e) {
          console.error("Failed to parse user preferences:", e);
        }
      }
      
      // Update preferences with new values
      const updatedPreferences = {
        ...userPreferences,
        notifications: {
          ...((userPreferences as any)?.notifications || {}),
          ...validatedData
        }
      };
      
      // Update user with new preferences
      const updatedUser = await storage.updateUser(req.user.id, { 
        userPreferences: JSON.stringify(updatedPreferences) 
      });
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Update user in session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        res.status(200).json({ 
          message: "Notification settings updated successfully",
          user: userWithoutPassword
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  // User preferences route for display settings
  app.post("/api/user/preferences", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const updateSchema = z.object({
        display: z.object({
          learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading']).optional(),
          theme: z.enum(['light', 'dark', 'system']).optional(),
          fontSize: z.enum(['small', 'medium', 'large']).optional()
        }).optional()
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      // Store display settings in userPreferences field as JSON
      let userPreferences = {};
      
      // Get existing preferences if they exist
      if (req.user.userPreferences) {
        try {
          userPreferences = typeof req.user.userPreferences === 'string' 
            ? JSON.parse(req.user.userPreferences) 
            : req.user.userPreferences;
        } catch (e) {
          console.error("Failed to parse user preferences:", e);
        }
      }
      
      // Update preferences with new values
      const updatedPreferences = {
        ...userPreferences,
        display: {
          ...((userPreferences as any)?.display || {}),
          ...(validatedData.display || {})
        }
      };
      
      // Update user with new preferences
      const updatedUser = await storage.updateUser(req.user.id, { 
        userPreferences: JSON.stringify(updatedPreferences) 
      });
      
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Update user in session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        res.status(200).json({ 
          message: "Display preferences updated successfully",
          user: userWithoutPassword
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Framework routes
  app.get("/api/frameworks", async (req, res, next) => {
    try {
      // Check cache first
      const cachedData = getCachedData(CACHE_KEYS.FRAMEWORKS);
      if (cachedData) {
        return res.json(cachedData);
      }

      // If not in cache, get from storage and cache it
      const frameworks = await storage.getAllFrameworks();
      cacheData(CACHE_KEYS.FRAMEWORKS, frameworks);
      res.json(frameworks);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/frameworks/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid framework ID" });
      }
      
      // Check cache first
      const cacheKey = CACHE_KEYS.FRAMEWORK(id);
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const framework = await storage.getFramework(id);
      
      if (!framework) {
        return res.status(404).json({ message: "Framework not found" });
      }
      
      // Cache the framework data
      cacheData(cacheKey, framework);
      res.json(framework);
    } catch (error) {
      next(error);
    }
  });
  
  // Module media upload
  app.post("/api/modules/:id/media", upload.single('media'), async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const moduleId = parseInt(req.params.id);
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: "Invalid module ID" });
      }

      const mediaUrl = `/uploads/${req.file.filename}`;
      
      res.json({ mediaUrl });
    } catch (error) {
      next(error);
    }
  });

  // Module routes
  app.get("/api/frameworks/:id/modules", async (req, res, next) => {
    try {
      const frameworkId = parseInt(req.params.id);
      
      if (isNaN(frameworkId)) {
        return res.status(400).json({ message: "Invalid framework ID" });
      }
      
      // Check cache first
      const cacheKey = CACHE_KEYS.MODULES(frameworkId);
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const modules = await storage.getModulesByFrameworkId(frameworkId);
      
      // Cache the modules data
      cacheData(cacheKey, modules);
      res.json(modules);
    } catch (error) {
      next(error);
    }
  });
  
  // Get all modules organized by framework ID
  app.get("/api/all-modules-by-framework", async (req, res, next) => {
    try {
      // Check cache first
      const cacheKey = CACHE_KEYS.ALL_MODULES_BY_FRAMEWORK;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      // Get all frameworks
      const frameworks = await storage.getAllFrameworks();
      
      // Create a map to hold modules by framework ID
      const modulesByFramework: Record<number, any[]> = {};
      
      // For each framework, get modules and add to map
      for (const framework of frameworks) {
        const modules = await storage.getModulesByFrameworkId(framework.id);
        modulesByFramework[framework.id] = modules;
      }
      
      // Cache the result
      cacheData(cacheKey, modulesByFramework);
      res.json(modulesByFramework);
    } catch (error) {
      next(error);
    }
  });
  
  // Get single module
  app.get("/api/modules/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid module ID" });
      }
      
      // Check cache first
      const cacheKey = CACHE_KEYS.MODULE(id);
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const module = await storage.getModule(id);
      
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      // Cache the module data
      cacheData(cacheKey, module);
      res.json(module);
    } catch (error) {
      next(error);
    }
  });
  
  // Create module
  app.post("/api/modules", async (req, res, next) => {
    try {
      const moduleData = req.body;
      
      if (!moduleData) {
        return res.status(400).json({ message: "No data provided" });
      }
      
      if (!moduleData.frameworkId) {
        return res.status(400).json({ message: "Framework ID is required" });
      }
      
      if (!moduleData.name) {
        return res.status(400).json({ message: "Module name is required" });
      }
      
      const framework = await storage.getFramework(moduleData.frameworkId);
      
      if (!framework) {
        return res.status(404).json({ message: "Framework not found" });
      }
      
      const newModule = await storage.createModule(moduleData);
      res.status(201).json(newModule);
    } catch (error) {
      next(error);
    }
  });
  
  // Update module content
  app.patch("/api/modules/:id", async (req, res, next) => {
    try {
      const moduleId = parseInt(req.params.id);
      
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: "Invalid module ID" });
      }
      
      const moduleData = req.body;
      
      if (!moduleData) {
        return res.status(400).json({ message: "No data provided" });
      }
      
      const module = await storage.getModule(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const updatedModule = await storage.updateModule(moduleId, moduleData);
      
      // Invalidate caches for this module and related framework modules
      invalidateCache(CACHE_KEYS.MODULE(moduleId));
      invalidateCachesByPattern(`modules:framework:${module.frameworkId}`);
      invalidateCache(CACHE_KEYS.ALL_MODULES_BY_FRAMEWORK);
      
      res.json(updatedModule);
    } catch (error) {
      next(error);
    }
  });
  
  // User progress routes
  app.get("/api/user/progress", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      
      // Check cache first
      const cacheKey = CACHE_KEYS.USER_PROGRESS(userId);
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const progress = await storage.getUserProgress(userId);
      
      // Cache the progress data
      cacheData(cacheKey, progress);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/user/progress", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { frameworkId, status, completedModules, totalModules } = req.body;
      
      if (!frameworkId || !status || totalModules === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Check if progress already exists
      const existingProgress = await storage.getUserProgressByFramework(userId, frameworkId);
      
      if (existingProgress) {
        // Update existing progress
        const updatedProgress = await storage.updateUserProgress(existingProgress.id, {
          status,
          completedModules,
        });
        
        return res.json(updatedProgress);
      }
      
      // Create new progress
      const newProgress = await storage.createUserProgress({
        userId,
        frameworkId,
        status,
        completedModules: completedModules || 0,
        totalModules,
      });
      
      res.status(201).json(newProgress);
    } catch (error) {
      next(error);
    }
  });
  
  // Module completion route
  app.patch("/api/modules/:id/complete", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const moduleId = parseInt(req.params.id);
      const { completed } = req.body;
      
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: "Invalid module ID" });
      }
      
      if (completed === undefined) {
        return res.status(400).json({ message: "Completed status is required" });
      }
      
      const module = await storage.getModule(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const updatedModule = await storage.updateModule(moduleId, { completed });
      
      // Invalidate caches for this module and related framework modules
      invalidateCache(CACHE_KEYS.MODULE(moduleId));
      invalidateCachesByPattern(`modules:framework:${module.frameworkId}`);
      invalidateCache(CACHE_KEYS.ALL_MODULES_BY_FRAMEWORK);
      
      // Update user progress
      if (updatedModule) {
        const userId = req.user!.id;
        const frameworkId = updatedModule.frameworkId;
        
        // Get all modules for this framework
        const modules = await storage.getModulesByFrameworkId(frameworkId);
        
        // Calculate completed modules
        const completedModules = modules.filter(m => m.completed).length;
        const totalModules = modules.length;
        
        // Determine status
        let status = "not_started";
        if (completedModules === totalModules) {
          status = "completed";
        } else if (completedModules > 0) {
          status = "in_progress";
        }
        
        // Update or create progress
        const existingProgress = await storage.getUserProgressByFramework(userId, frameworkId);
        
        if (existingProgress) {
          await storage.updateUserProgress(existingProgress.id, {
            status,
            completedModules,
          });
        } else {
          await storage.createUserProgress({
            userId,
            frameworkId,
            status,
            completedModules,
            totalModules,
          });
        }
        
        // Invalidate user progress cache
        invalidateCachesByPattern(`user:${userId}:progress`);
      }
      
      res.json(updatedModule);
    } catch (error) {
      next(error);
    }
  });
  
  // AI Assistant routes - Removed
  
  // Quiz routes
  app.get("/api/quizzes/framework/:id", async (req, res, next) => {
    try {
      const frameworkId = parseInt(req.params.id);
      const level = req.query.level as string | undefined;
      
      if (isNaN(frameworkId)) {
        return res.status(400).json({ message: "Invalid framework ID" });
      }
      
      // Check cache first
      const cacheKey = CACHE_KEYS.QUIZZES(frameworkId, level);
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const quizzes = await storage.getQuizzesByFramework(frameworkId, level);
      
      // Cache the quizzes data
      cacheData(cacheKey, quizzes);
      res.json(quizzes);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/quizzes/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      // Check cache first
      const cacheKey = CACHE_KEYS.QUIZ(id);
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // Cache the quiz data
      cacheData(cacheKey, quiz);
      res.json(quiz);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/quizzes", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Validate quiz data
      const parseResult = insertQuizSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid quiz data", 
          errors: parseResult.error.format() 
        });
      }
      
      const quizData = parseResult.data;
      
      // Check if framework exists
      const framework = await storage.getFramework(quizData.frameworkId);
      if (!framework) {
        return res.status(404).json({ message: "Framework not found" });
      }
      
      const quiz = await storage.createQuiz(quizData);
      
      // Invalidate cached framework quizzes
      invalidateCachesByPattern(`quizzes:framework:${quizData.frameworkId}`);
      
      res.status(201).json(quiz);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/quizzes/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      const updatedQuiz = await storage.updateQuiz(id, req.body);
      
      // Invalidate caches for this quiz and related framework quizzes
      invalidateCache(CACHE_KEYS.QUIZ(id));
      invalidateCachesByPattern(`quizzes:framework:${quiz.frameworkId}`);
      
      res.json(updatedQuiz);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/quizzes/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      await storage.deleteQuiz(id);
      
      // Invalidate caches for this quiz and related framework quizzes
      invalidateCache(CACHE_KEYS.QUIZ(id));
      invalidateCachesByPattern(`quizzes:framework:${quiz.frameworkId}`);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Quiz Attempts routes
  app.get("/api/quiz-attempts/user", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      
      // For quiz attempts, always fetch fresh data to ensure real-time updates
      // This ensures that newly submitted quiz attempts are always visible
      const attempts = await storage.getUserQuizAttempts(userId);
      
      // Set cache control headers to prevent browser caching
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      // Return the attempts without caching
      res.json(attempts);
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      next(error);
    }
  });
  
  app.get("/api/quiz-attempts/quiz/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const quizId = parseInt(req.params.id);
      
      if (isNaN(quizId)) {
        return res.status(400).json({ message: "Invalid quiz ID" });
      }
      
      // Check cache first
      const cacheKey = CACHE_KEYS.QUIZ_ATTEMPTS(quizId);
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const attempts = await storage.getQuizAttemptsByQuiz(quizId);
      
      // Cache the attempts data
      cacheData(cacheKey, attempts);
      res.json(attempts);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/quiz-attempts", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      console.log("Unauthorized quiz attempt - user not authenticated");
      return res.sendStatus(401);
    }
    
    try {
      console.log("Quiz attempt request received from user ID:", req.user!.id);
      
      // Always use the authenticated user's ID for security
      // This ensures that users can only submit attempts for themselves
      const requestDataWithUserId = {
        ...req.body,
        userId: req.user!.id
      };
      
      console.log("Quiz attempt data with user ID:", requestDataWithUserId);
      
      // Validate attempt data (including userId)
      const parseResult = insertQuizAttemptSchema.safeParse(requestDataWithUserId);
      
      if (!parseResult.success) {
        console.log("Quiz attempt validation error:", parseResult.error.format());
        return res.status(400).json({ 
          message: "Invalid quiz attempt data", 
          errors: parseResult.error.format() 
        });
      }
      
      const attemptData = parseResult.data;
      
      // Check if quiz exists
      const quiz = await storage.getQuiz(attemptData.quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // Ensure the userId matches the authenticated user
      // This is a security measure to prevent user ID spoofing
      if (attemptData.userId !== req.user!.id) {
        console.log("User ID security check - overriding submitted ID:", { 
          submittedUserId: attemptData.userId, 
          authenticatedUserId: req.user!.id 
        });
        attemptData.userId = req.user!.id;
      }
      
      console.log("Creating quiz attempt with data:", {
        quizId: attemptData.quizId,
        userId: attemptData.userId,
        score: attemptData.score
      });
      
      const attempt = await storage.createQuizAttempt(attemptData);
      
      // Invalidate quiz attempts caches
      invalidateCache(CACHE_KEYS.USER_QUIZ_ATTEMPTS(req.user!.id));
      invalidateCache(CACHE_KEYS.QUIZ_ATTEMPTS(attemptData.quizId));
      
      // Track quiz attempt with xAPI
      if (req.user) {
        try {
          const framework = await storage.getFramework(quiz.frameworkId);
          
          if (framework) {
            await xapiService.trackQuizAttempt(
              req.user.id,
              quiz.id,
              quiz.title,
              framework.id,
              framework.name,
              attemptData.score,
              attemptData.maxScore,
              attemptData.passed,
              attemptData.timeTaken || 0,
              {
                name: req.user.name || req.user.username,
                email: req.user.email || `${req.user.username}@frameworkpro.app`
              }
            );
          }
        } catch (error) {
          console.error("xAPI tracking error:", error);
          // Continue even if xAPI tracking fails
        }
      }
      
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      next(error);
    }
  });
  
  // Endpoint to clear all quiz attempts for the authenticated user
  app.delete("/api/quiz-attempts/user/clear", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    try {
      const userId = req.user!.id;
      console.log(`Request to clear all quiz attempts for user ID: ${userId}`);
      
      await storage.clearUserQuizAttempts(userId);
      
      // Invalidate related caches
      invalidateCache(CACHE_KEYS.USER_QUIZ_ATTEMPTS(userId));
      
      console.log(`Successfully cleared all quiz attempts for user ID: ${userId}`);
      res.status(200).json({ 
        success: true,
        message: "All quiz attempts have been cleared successfully" 
      });
    } catch (error) {
      console.error("Error clearing quiz attempts:", error);
      next(error);
    }
  });
  
  // xAPI routes
  app.post("/api/xapi/statements", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const statement = req.body;
      const parseResult = insertXapiStatementSchema.safeParse({
        ...statement,
        userId: req.user!.id,
        timestamp: new Date(),
        stored: false
      });
      
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid xAPI statement",
          errors: parseResult.error.format()
        });
      }
      
      const user = await storage.getUser(req.user!.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Define the object info type
      interface ObjectInfo {
        name: string;
        description?: string;
        type: string;
      }
      
      // Get object info based on objectType and objectId
      let objectInfo: ObjectInfo = {
        name: statement.object,
        type: "http://adlnet.gov/expapi/activities/activity"
      };
      
      if (statement.objectType === "module") {
        const module = await storage.getModule(statement.objectId);
        if (module) {
          const framework = await storage.getFramework(module.frameworkId);
          objectInfo = {
            name: module.name,
            description: `Module in ${framework?.name || ''} framework`,
            type: "http://adlnet.gov/expapi/activities/module"
          };
        }
      } else if (statement.objectType === "framework") {
        const framework = await storage.getFramework(statement.objectId);
        if (framework) {
          objectInfo = {
            name: framework.name,
            description: framework.description,
            type: "http://adlnet.gov/expapi/activities/course"
          };
        }
      } else if (statement.objectType === "quiz") {
        const quiz = await storage.getQuiz(statement.objectId);
        if (quiz) {
          objectInfo = {
            name: quiz.title,
            description: quiz.description,
            type: "http://adlnet.gov/expapi/activities/assessment"
          };
        }
      }
      
      // Extract and properly type the statement data to match the expected schema
      const { userId, verb, object, objectType, objectId } = parseResult.data;
      
      // Create a properly typed statement object
      const statementData: Omit<XapiStatement, 'id' | 'timestamp' | 'stored'> = {
        userId,
        verb,
        object,
        objectType,
        objectId,
        // Ensure these fields are string or null, not undefined
        result: parseResult.data.result !== undefined ? parseResult.data.result : null,
        context: parseResult.data.context !== undefined ? parseResult.data.context : null
      };
      
      const result = await xapiService.createStatement(
        statementData,
        {
          name: user.name || user.username,
          email: user.email || `${user.username}@frameworkpro.app`
        },
        objectInfo
      );
      
      if (!result) {
        return res.status(500).json({ message: "Failed to create xAPI statement" });
      }
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/xapi/statements", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Implementation will depend on how we want to query xAPI statements
      // For now, we'll return a not implemented error
      res.status(501).json({ message: "API not fully implemented" });
    } catch (error) {
      next(error);
    }
  });
  
  // LRS Configuration routes
  app.post("/api/lrs/config", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const config = req.body;
      const parseResult = insertLrsConfigurationSchema.safeParse(config);
      
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid LRS configuration",
          errors: parseResult.error.format()
        });
      }
      
      // Implementation will depend on how we want to store LRS configurations
      // For now, we'll return a not implemented error
      res.status(501).json({ message: "API not fully implemented" });
    } catch (error) {
      next(error);
    }
  });
  
  // SCORM routes
  app.post("/api/scorm/data", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { scoId, elementName, elementValue } = req.body;
      
      if (!scoId || !elementName || elementValue === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const result = await scormService.storeScormData(
        req.user!.id,
        scoId,
        elementName,
        elementValue
      );
      
      if (!result) {
        return res.status(500).json({ message: "Failed to store SCORM data" });
      }
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/scorm/data/:scoId", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const scoId = req.params.scoId;
      
      if (!scoId) {
        return res.status(400).json({ message: "SCO ID is required" });
      }
      
      const data = await scormService.getScormDataBySCO(req.user!.id, scoId);
      const lmsData = scormService.transformScormDataToLMS(data);
      
      res.json(lmsData);
    } catch (error) {
      next(error);
    }
  });
  
  // Serve SCORM API wrapper script
  app.get("/api/scorm/api-wrapper.js", async (req, res, next) => {
    try {
      const version = req.query.version as string || "scorm2004";
      const apiEndpoint = `${req.protocol}://${req.headers.host}/api/scorm/data`;
      
      const script = scormService.getScormApiWrapperScript(
        version as "scorm1.2" | "scorm2004",
        apiEndpoint
      );
      
      res.setHeader("Content-Type", "application/javascript");
      res.send(script);
    } catch (error) {
      next(error);
    }
  });
  
  // Enhanced module completion route with xAPI tracking
  app.patch("/api/modules/:id/complete-with-tracking", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const moduleId = parseInt(req.params.id);
      const { completed } = req.body;
      
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: "Invalid module ID" });
      }
      
      if (completed === undefined) {
        return res.status(400).json({ message: "Completed status is required" });
      }
      
      const module = await storage.getModule(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const updatedModule = await storage.updateModule(moduleId, { completed });
      
      // Invalidate all relevant caches to ensure UI updates correctly
      invalidateCache(CACHE_KEYS.MODULE(moduleId));
      invalidateCachesByPattern(`modules:framework:${module.frameworkId}`);
      invalidateCache(CACHE_KEYS.ALL_MODULES_BY_FRAMEWORK);
      
      // Update user progress and track with xAPI
      if (updatedModule && completed) {
        const userId = req.user!.id;
        const frameworkId = updatedModule.frameworkId;
        
        // Get all modules for this framework
        const modules = await storage.getModulesByFrameworkId(frameworkId);
        
        // Calculate completed modules
        const completedModules = modules.filter(m => m.completed).length;
        const totalModules = modules.length;
        
        // Determine status
        let status = "not_started";
        if (completedModules === totalModules) {
          status = "completed";
        } else if (completedModules > 0) {
          status = "in_progress";
        }
        
        // Update or create progress
        const existingProgress = await storage.getUserProgressByFramework(userId, frameworkId);
        
        if (existingProgress) {
          await storage.updateUserProgress(existingProgress.id, {
            status,
            completedModules,
          });
        } else {
          await storage.createUserProgress({
            userId,
            frameworkId,
            status,
            completedModules,
            totalModules,
          });
        }
        
        // Invalidate user progress cache
        invalidateCache(CACHE_KEYS.USER_PROGRESS(userId));
        
        // Track with xAPI if module was completed
        try {
          const user = await storage.getUser(userId);
          const framework = await storage.getFramework(frameworkId);
          
          if (user && framework) {
            await xapiService.trackModuleCompletion(
              userId,
              moduleId,
              updatedModule.name,
              frameworkId,
              framework.name,
              {
                name: user.name || user.username,
                email: user.email || `${user.username}@frameworkpro.app`
              }
            );
            
            // If all modules are completed, track framework completion as well
            if (completedModules === totalModules) {
              await xapiService.trackFrameworkCompletion(
                userId,
                frameworkId,
                framework.name,
                completedModules,
                totalModules,
                {
                  name: user.name || user.username,
                  email: user.email || `${user.username}@frameworkpro.app`
                }
              );
            }
          }
        } catch (error) {
          console.error("xAPI tracking error:", error);
          // Continue even if xAPI tracking fails
        }
      }
      
      res.json(updatedModule);
    } catch (error) {
      next(error);
    }
  });

  // Configure multer storage for SCORM uploads
  const scormStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Create directory if it doesn't exist
      const uploadDir = './public/scorm-packages';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Create a unique filename with timestamp
      const uniquePrefix = Date.now() + '-';
      cb(null, uniquePrefix + file.originalname);
    }
  });
  
  // Create multer upload instance
  const scormUpload = multer({ 
    storage: scormStorage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB file size limit
    },
    fileFilter: (req, file, cb) => {
      // Accept only zip files
      if (file.mimetype === 'application/zip' || 
          file.mimetype === 'application/x-zip-compressed' ||
          file.mimetype === 'application/octet-stream') {
        cb(null, true);
      } else {
        cb(new Error('Only ZIP files are allowed for SCORM packages'));
      }
    }
  });

  // SCORM package upload route
  app.post('/api/scorm/upload', scormUpload.single('scormPackage'), async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const { moduleId } = req.body;
      
      if (!moduleId) {
        return res.status(400).json({ message: 'Module ID is required' });
      }
      
      const parsedModuleId = parseInt(moduleId, 10);
      if (isNaN(parsedModuleId)) {
        return res.status(400).json({ message: 'Invalid module ID' });
      }
      
      // Get the module
      const module = await storage.getModule(parsedModuleId);
      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }
      
      // Extract the filename and create a directory for the package
      const uploadedFilename = req.file.filename;
      const packageName = path.basename(uploadedFilename, path.extname(uploadedFilename));
      const extractPath = path.join('./public/scorm-packages', packageName);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(extractPath)) {
        fs.mkdirSync(extractPath, { recursive: true });
      }
      
      // Extract the uploaded ZIP file
      const extractFile = async () => {
        try {
          // Use extract-zip package which should be installed
          const extractZip = require('extract-zip');
          await extractZip(req.file!.path, { dir: path.resolve(extractPath) });
          
          // Check if the package has an imsmanifest.xml file (required for SCORM)
          const manifestPath = path.join(extractPath, 'imsmanifest.xml');
          if (fs.existsSync(manifestPath)) {
            return manifestPath;
          } else {
            throw new Error('Invalid SCORM package: missing imsmanifest.xml');
          }
        } catch (error) {
          throw error;
        }
      };
      
      await extractFile();
      
      // Delete the original zip file
      fs.unlinkSync(req.file.path);
      
      // Update the module with the SCORM package path
      // Find the index.html file in the extracted package
      let indexPath = '';
      const findIndexFile = (dir: string): string | null => {
        const files = fs.readdirSync(dir);
        
        // Check if index.html exists in the current directory
        if (files.includes('index.html')) {
          return path.join(dir, 'index.html');
        }
        
        // Look in subdirectories
        for (const file of files) {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isDirectory()) {
            const indexInSubdir = findIndexFile(filePath);
            if (indexInSubdir) {
              return indexInSubdir;
            }
          }
        }
        
        return null;
      };
      
      const indexFile = findIndexFile(extractPath);
      if (!indexFile) {
        throw new Error('Invalid SCORM package: no index.html found');
      }
      
      // Get relative path from public directory
      const relativePath = indexFile.replace('./public', '');
      
      // Update the module with the SCORM package path
      const updatedModule = await storage.updateModule(parsedModuleId, {
        scormPath: relativePath
      });
      
      res.json({ 
        message: 'SCORM package uploaded and extracted successfully',
        module: updatedModule
      });
      
    } catch (error: any) {
      console.error('SCORM upload error:', error);
      
      // Clean up any partially uploaded files
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ message: `SCORM upload failed: ${error.message}` });
    }
  });

  // SCORM package list route
  app.get('/api/scorm/packages', async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const scormPackagesDir = './public/scorm-packages';
      
      if (!fs.existsSync(scormPackagesDir)) {
        return res.json([]);
      }
      
      const packages = fs.readdirSync(scormPackagesDir)
        .filter(item => {
          const itemPath = path.join(scormPackagesDir, item);
          return fs.statSync(itemPath).isDirectory();
        })
        .map(dir => {
          const manifestPath = path.join(scormPackagesDir, dir, 'imsmanifest.xml');
          const hasManifest = fs.existsSync(manifestPath);
          
          return {
            name: dir,
            path: `/scorm-packages/${dir}`,
            isValid: hasManifest,
            uploadedAt: fs.statSync(path.join(scormPackagesDir, dir)).birthtime
          };
        });
      
      res.json(packages);
      
    } catch (error: any) {
      console.error('Error listing SCORM packages:', error);
      res.status(500).json({ message: `Failed to list SCORM packages: ${error.message}` });
    }
  });
  
  // SCORM package delete route
  app.delete('/api/scorm/packages/:name', async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const packageName = req.params.name;
      const packagePath = path.join('./public/scorm-packages', packageName);
      
      if (!fs.existsSync(packagePath)) {
        return res.status(404).json({ message: 'SCORM package not found' });
      }
      
      // Remove the package directory recursively
      fs.rmSync(packagePath, { recursive: true, force: true });
      
      res.status(204).send();
      
    } catch (error: any) {
      console.error('Error deleting SCORM package:', error);
      res.status(500).json({ message: `Failed to delete SCORM package: ${error.message}` });
    }
  });

  // Exercise routes
  // Get all exercises for a framework
  app.get("/api/frameworks/:frameworkId/exercises", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const frameworkId = parseInt(req.params.frameworkId);
      if (isNaN(frameworkId)) {
        return res.status(400).json({ message: "Invalid framework ID" });
      }

      const exercises = await storage.getExercisesByFramework(frameworkId);
      res.json(exercises);
    } catch (error) {
      next(error);
    }
  });

  // Get all exercises for a module
  app.get("/api/modules/:moduleId/exercises", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const moduleId = parseInt(req.params.moduleId);
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: "Invalid module ID" });
      }

      const exercises = await storage.getExercisesByModule(moduleId);
      res.json(exercises);
    } catch (error) {
      next(error);
    }
  });

  // Get a specific exercise
  app.get("/api/exercises/:exerciseId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const exerciseId = parseInt(req.params.exerciseId);
      if (isNaN(exerciseId)) {
        return res.status(400).json({ message: "Invalid exercise ID" });
      }

      const exercise = await storage.getExercise(exerciseId);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      res.json(exercise);
    } catch (error) {
      next(error);
    }
  });

  // Create a new exercise
  app.post("/api/exercises", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      // Validate the request body using the insert schema
      const validatedData = insertExerciseSchema.parse(req.body);
      
      // Create the exercise
      const exercise = await storage.createExercise(validatedData);
      
      // Return the created exercise
      res.status(201).json(exercise);
      
      // Invalidate related caches
      invalidateRelatedCaches([
        `${CACHE_KEYS.FRAMEWORK_EXERCISES_PREFIX}${exercise.frameworkId}`,
        `${CACHE_KEYS.MODULE_EXERCISES_PREFIX}${exercise.moduleId}`
      ]);
    } catch (error) {
      next(error);
    }
  });

  // Update an existing exercise
  app.patch("/api/exercises/:exerciseId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const exerciseId = parseInt(req.params.exerciseId);
      if (isNaN(exerciseId)) {
        return res.status(400).json({ message: "Invalid exercise ID" });
      }

      // Find the exercise
      const existingExercise = await storage.getExercise(exerciseId);
      if (!existingExercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      // Validate the request body
      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        scenario: z.string().optional(),
        steps: z.string().optional(),
        resources: z.string().nullable().optional(),
        sampleSolution: z.string().nullable().optional(),
        difficulty: z.string().optional(),
        estimatedTime: z.number().optional()
      });

      const validatedData = updateSchema.parse(req.body);
      
      // Update the exercise
      const updatedExercise = await storage.updateExercise(exerciseId, validatedData);
      
      // Return the updated exercise
      res.json(updatedExercise);
      
      // Invalidate related caches
      invalidateRelatedCaches([
        `${CACHE_KEYS.EXERCISE_PREFIX}${exerciseId}`,
        `${CACHE_KEYS.FRAMEWORK_EXERCISES_PREFIX}${existingExercise.frameworkId}`,
        `${CACHE_KEYS.MODULE_EXERCISES_PREFIX}${existingExercise.moduleId}`
      ]);
    } catch (error) {
      next(error);
    }
  });

  // Delete an exercise
  app.delete("/api/exercises/:exerciseId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const exerciseId = parseInt(req.params.exerciseId);
      if (isNaN(exerciseId)) {
        return res.status(400).json({ message: "Invalid exercise ID" });
      }

      // Find the exercise
      const exercise = await storage.getExercise(exerciseId);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      // Delete the exercise
      await storage.deleteExercise(exerciseId);
      
      // Return success
      res.status(204).send();
      
      // Invalidate related caches
      invalidateRelatedCaches([
        `${CACHE_KEYS.EXERCISE_PREFIX}${exerciseId}`,
        `${CACHE_KEYS.FRAMEWORK_EXERCISES_PREFIX}${exercise.frameworkId}`,
        `${CACHE_KEYS.MODULE_EXERCISES_PREFIX}${exercise.moduleId}`
      ]);
    } catch (error) {
      next(error);
    }
  });

  // Get submissions for an exercise
  app.get("/api/exercises/:exerciseId/submissions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const exerciseId = parseInt(req.params.exerciseId);
      if (isNaN(exerciseId)) {
        return res.status(400).json({ message: "Invalid exercise ID" });
      }

      const submissions = await storage.getExerciseSubmissionsByExercise(exerciseId);
      res.json(submissions);
    } catch (error) {
      next(error);
    }
  });

  // Get user's exercise submissions
  app.get("/api/user/exercise-submissions", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const submissions = await storage.getUserExerciseSubmissions(req.user.id);
      res.json(submissions);
    } catch (error) {
      next(error);
    }
  });
  
  // Delete exercise submission
  app.delete("/api/exercise-submissions/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const submissionId = parseInt(req.params.id);
      
      // Verify the submission exists and belongs to the user
      const submission = await storage.getExerciseSubmission(submissionId);
      if (!submission) {
        return res.status(404).send("Submission not found");
      }
      
      if (submission.userId !== req.user.id) {
        return res.status(403).send("Forbidden: This submission belongs to another user");
      }
      
      // Delete the submission
      await storage.deleteExerciseSubmission(submissionId);
      
      // Invalidate related caches
      invalidateCache(CACHE_KEYS.USER_EXERCISE_SUBMISSIONS(req.user.id));
      invalidateCachesByPattern(`exercise:*:submissions`);
      
      res.status(200).send({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Submit a solution for an exercise
  app.post("/api/exercises/:exerciseId/submit", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const exerciseId = parseInt(req.params.exerciseId);
      if (isNaN(exerciseId)) {
        return res.status(400).json({ message: "Invalid exercise ID" });
      }

      // Find the exercise
      const exercise = await storage.getExercise(exerciseId);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      // Validate the request body
      const submitSchema = z.object({
        solution: z.string(),
        status: z.string().default("submitted")
      });

      const validatedData = submitSchema.parse(req.body);
      
      // Create the submission
      const submission = await storage.createExerciseSubmission({
        exerciseId,
        userId: req.user.id,
        solution: validatedData.solution,
        status: validatedData.status,
        score: null,
        feedback: null
      });
      
      // Return the submission
      res.status(201).json(submission);
    } catch (error) {
      next(error);
    }
  });

  // Update a submission (provide feedback or score)
  app.patch("/api/exercise-submissions/:submissionId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }

      const submissionId = parseInt(req.params.submissionId);
      if (isNaN(submissionId)) {
        return res.status(400).json({ message: "Invalid submission ID" });
      }

      // Find the submission
      const submission = await storage.getExerciseSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Validate the request body
      const updateSchema = z.object({
        status: z.string().optional(),
        score: z.number().nullable().optional(),
        feedback: z.string().nullable().optional()
      });

      const validatedData = updateSchema.parse(req.body);
      
      // Update the submission
      const updatedSubmission = await storage.updateExerciseSubmission(submissionId, validatedData);
      
      // Return the updated submission
      res.json(updatedSubmission);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  
  // Certificate API routes
  app.get("/api/certificates", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const certificates = await storage.getUserCertificates(req.user.id);
      res.json(certificates);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/certificates/framework/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const frameworkId = parseInt(req.params.id);
      if (isNaN(frameworkId)) {
        return res.status(400).send("Invalid framework ID");
      }
      
      const certificates = await storage.getFrameworkCertificates(frameworkId);
      res.json(certificates);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/certificates/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const certificateId = parseInt(req.params.id);
      if (isNaN(certificateId)) {
        return res.status(400).send("Invalid certificate ID");
      }
      
      const certificate = await storage.getCertificate(certificateId);
      if (!certificate) {
        return res.status(404).send("Certificate not found");
      }
      
      // Only allow users to see their own certificates unless they're admins
      if (certificate.userId !== req.user.id && (!req.user.role || req.user.role !== "admin")) {
        return res.status(403).send("Forbidden");
      }
      
      res.json(certificate);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/certificates", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      // Only admins can create certificates
      if (!req.user.role || req.user.role !== "admin") {
        return res.status(403).send("Only administrators can issue certificates");
      }
      
      const certData = req.body;
      const certificate = await storage.createCertificate(certData);
      res.status(201).json(certificate);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/certificates/issue/:frameworkId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const frameworkId = parseInt(req.params.frameworkId);
      if (isNaN(frameworkId)) {
        return res.status(400).send("Invalid framework ID");
      }
      
      // Verify the user has completed the framework
      const progress = await storage.getUserProgressByFramework(req.user.id, frameworkId);
      if (!progress || progress.status !== "completed") {
        return res.status(400).send("Framework must be completed before certificate can be issued");
      }
      
      // Get framework details
      const framework = await storage.getFramework(frameworkId);
      if (!framework) {
        return res.status(404).send("Framework not found");
      }
      
      // Check if user already has a certificate for this framework
      const userCerts = await storage.getUserCertificates(req.user.id);
      const existingCert = userCerts.find(cert => cert.frameworkId === frameworkId && cert.status === "active");
      
      if (existingCert) {
        return res.status(400).send("User already has an active certificate for this framework");
      }
      
      // Generate certificate number (unique identifier)
      const certNumber = `FP-${frameworkId}-${req.user.id}-${Date.now()}`;
      
      // Create the certificate
      const certData = {
        userId: req.user.id,
        frameworkId: frameworkId,
        title: `${framework.name} Certificate`,
        description: `This certifies that ${req.user.name} has successfully mastered the ${framework.name} framework and demonstrated comprehensive understanding of its concepts, methodologies, and practical applications in business problem-solving and strategic analysis.`,
        certificateNumber: certNumber,
        status: "active",
        achievements: JSON.stringify({
          completedAt: new Date(),
          framework: framework.name,
          modules: progress.completedModules
        })
      };
      
      const certificate = await storage.createCertificate(certData);
      res.status(201).json(certificate);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/certificates/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      // Only admins can update certificates
      if (!req.user.role || req.user.role !== "admin") {
        return res.status(403).send("Only administrators can update certificates");
      }
      
      const certificateId = parseInt(req.params.id);
      if (isNaN(certificateId)) {
        return res.status(400).send("Invalid certificate ID");
      }
      
      const certificate = await storage.updateCertificate(certificateId, req.body);
      if (!certificate) {
        return res.status(404).send("Certificate not found");
      }
      
      res.json(certificate);
    } catch (error) {
      next(error);
    }
  });

  // Custom AI Model routes
// Removed custom AI endpoints as part of the AI feature removal

app.delete("/api/certificates/:id/revoke", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      // Only admins can revoke certificates
      if (!req.user.role || req.user.role !== "admin") {
        return res.status(403).send("Only administrators can revoke certificates");
      }
      
      const certificateId = parseInt(req.params.id);
      if (isNaN(certificateId)) {
        return res.status(400).send("Invalid certificate ID");
      }
      
      const certificate = await storage.revokeCertificate(certificateId);
      if (!certificate) {
        return res.status(404).send("Certificate not found");
      }
      
      res.json(certificate);
    } catch (error) {
      next(error);
    }
  });

  // Verify certificate (public access)
  app.get("/api/certificates/verify/:certificateNumber", async (req, res, next) => {
    try {
      const certificateNumber = req.params.certificateNumber;
      if (!certificateNumber) {
        return res.status(400).json({ 
          verified: false, 
          message: "Invalid certificate number" 
        });
      }
      
      // Find certificate by number using storage
      const allCertificates = await storage.getUserCertificates(0); // Get all certificates (we'll filter)
      const certificates = allCertificates.filter(cert => cert.certificateNumber === certificateNumber);
      
      if (!certificates || certificates.length === 0) {
        return res.status(404).json({ 
          verified: false, 
          message: "Certificate not found" 
        });
      }
      
      const certificate = certificates[0];
      
      // Get framework information
      const framework = await storage.getFramework(certificate.frameworkId);
      if (!framework) {
        return res.status(404).json({ 
          verified: false, 
          message: "Framework information not found" 
        });
      }
      
      // Get user information
      const user = await storage.getUser(certificate.userId);
      if (!user) {
        return res.status(404).json({ 
          verified: false, 
          message: "User information not found" 
        });
      }
      
      // Return the verification result
      res.json({
        verified: certificate.status === "active",
        certificate: {
          certificateNumber: certificate.certificateNumber,
          title: certificate.title,
          status: certificate.status,
          issueDate: certificate.issueDate,
          framework: framework.name,
          userName: user.name || user.username,
          description: certificate.description
        }
      });
    } catch (error) {
      console.error("Certificate verification error:", error);
      res.status(500).json({ 
        verified: false, 
        message: "An error occurred during verification" 
      });
    }
  });

  // Download certificate
  app.get("/api/certificates/:id/download", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const certificateId = parseInt(req.params.id);
      if (isNaN(certificateId)) {
        return res.status(400).send("Invalid certificate ID");
      }
      
      // Get certificate data
      const certificate = await storage.getCertificate(certificateId);
      if (!certificate) {
        return res.status(404).send("Certificate not found");
      }
      
      // Only allow users to download their own certificates unless they're admins
      if (certificate.userId !== req.user.id && (!req.user.role || req.user.role !== "admin")) {
        return res.status(403).send("Forbidden");
      }
      
      // Get user information
      const user = await storage.getUser(certificate.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }
      
      // Get framework information
      const framework = await storage.getFramework(certificate.frameworkId);
      if (!framework) {
        return res.status(404).send("Framework not found");
      }
      
      // Use proper path for images in public directory
      const logoPath = 'public/images/fp-logo-new.jpg';
      const signaturePath = 'public/images/manas-signature.png';
      
      let logoBase64 = '';
      let signatureBase64 = '';
      
      try {
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = `data:image/jpeg;base64,${logoData.toString('base64')}`;
        
        const signatureData = fs.readFileSync(signaturePath);
        signatureBase64 = `data:image/png;base64,${signatureData.toString('base64')}`;
      } catch (err) {
        console.error('Error reading image files:', err);
        // Fall back to using URLs if files can't be read
        logoBase64 = '/api/static/images/fp-logo-new.jpg';
        signatureBase64 = '/api/static/images/manas-signature.png';
      }
      
      // Get framework-specific styling
      const getAccentColor = (name: string) => {
        const colors = {
          'MECE': '#3B82F6', // Blue
          'Design Thinking': '#8B5CF6', // Purple
          'SWOT': '#10B981', // Green
          'First Principles': '#F59E0B', // Amber (Gold)
          "Porter's Five Forces": '#EF4444', // Red
          'Jobs-To-Be-Done': '#6366F1', // Indigo
          'Blue Ocean': '#0EA5E9', // Sky Blue
          'SCAMPER': '#EC4899', // Pink
          'Problem-Tree': '#14B8A6', // Teal
          'Pareto': '#F97316'  // Orange
        };
        
        return colors[name as keyof typeof colors] || '#D4AF37'; // Default to gold if not found
      };
      
      const getBackgroundInfo = (name: string) => {
        if (name === 'MECE') {
          return {
            background: "#0F172A", // Dark blue
            gradient: "linear-gradient(to bottom, rgba(15, 23, 42, 0.97), rgba(30, 41, 59, 0.97))",
            pattern: "linear-gradient(45deg, rgba(59, 130, 246, 0.07) 25%, transparent 25%, transparent 75%, rgba(59, 130, 246, 0.07) 75%), linear-gradient(45deg, rgba(59, 130, 246, 0.05) 25%, transparent 25%, transparent 75%, rgba(59, 130, 246, 0.05) 75%)",
            patternSize: "20px 20px",
            innerBg: "rgba(241, 245, 249, 0.97)", // Very light blue-gray
            accentTextColor: "#1e40af"
          };
        } else {
          return {
            background: "#F8F5E6", // Cream background
            gradient: "linear-gradient(to bottom, rgba(248, 245, 230, 0.97), rgba(255, 253, 244, 0.97))",
            pattern: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 1px, transparent 1px, transparent 50px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0.05) 1px, transparent 1px, transparent 50px)",
            patternSize: "50px 50px",
            innerBg: "rgba(248, 245, 230, 0.95)",
            accentTextColor: "#996515"
          };
        }
      };
      
      const accentColor = getAccentColor(framework.name);
      const bgInfo = getBackgroundInfo(framework.name);
      
      // Generate HTML for certificate with framework-specific styling
      const certificateHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${certificate.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Outfit:wght@400;500;700&display=swap');
          
          body {
            font-family: 'Outfit', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f5f5f5;
          }
          .certificate {
            width: 800px;
            height: 600px;
            background: ${bgInfo.background};
            background-image: ${bgInfo.gradient};
            color: #333;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            text-align: center;
            position: relative;
            overflow: hidden;
            border: 10px solid ${accentColor};
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: ${bgInfo.pattern};
            background-size: ${bgInfo.patternSize};
            opacity: 0.1;
          }
          
          /* Decorative Corner Elements */
          .corner-top-left, .corner-top-right, .corner-bottom-left, .corner-bottom-right {
            position: absolute;
            width: 64px;
            height: 64px;
            border-width: 4px;
            border-color: ${accentColor};
          }
          .corner-top-left {
            top: 0;
            left: 0;
            border-top-style: solid;
            border-left-style: solid;
            border-top-left-radius: 16px;
          }
          .corner-top-right {
            top: 0;
            right: 0;
            border-top-style: solid;
            border-right-style: solid;
            border-top-right-radius: 16px;
          }
          .corner-bottom-left {
            bottom: 0;
            left: 0;
            border-bottom-style: solid;
            border-left-style: solid;
            border-bottom-left-radius: 16px;
          }
          .corner-bottom-right {
            bottom: 0;
            right: 0;
            border-bottom-style: solid;
            border-right-style: solid;
            border-bottom-right-radius: 16px;
          }
          
          .inner-content {
            padding: 24px;
            background: linear-gradient(rgba(255, 255, 255, 0.8), ${bgInfo.innerBg});
            background-position: 0 0;
            background-size: cover;
            background-color: ${bgInfo.innerBg};
            backdrop-filter: blur(4px);
            height: calc(100% - 48px);
            position: relative;
            z-index: 1;
            border-radius: 8px;
            box-shadow: ${framework.name === 'MECE' ? 'inset 0 0 30px rgba(59, 130, 246, 0.1)' : 'inset 0 0 30px rgba(212, 175, 55, 0.1)'};
          }
          
          .header {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .logo {
            width: 80px;
            margin-bottom: 16px;
          }
          .title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #000;
          }
          .subtitle {
            font-size: 16px;
            margin-bottom: 24px;
            color: #555;
          }
          
          .verified-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 8px auto;
            padding: 6px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            background: linear-gradient(to right, ${accentColor}10, ${accentColor}20);
            border: 1px solid ${accentColor};
            color: ${bgInfo.accentTextColor};
            max-width: fit-content;
          }
          
          .content {
            margin: 24px 0;
          }
          .name {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #000;
          }
          .description-container {
            max-width: 90%;
            margin: 0 auto;
            padding: 16px;
            border: 1px solid ${accentColor}40;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.8);
            box-shadow: 0 2px 10px ${accentColor}15;
          }
          .description {
            font-size: 14px;
            line-height: 1.5;
            color: #555;
          }
          
          .footer-info {
            margin-top: 24px;
            padding-top: 16px;
            border-top: 1px solid ${accentColor}30;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            font-size: 12px;
            color: #555;
          }
          .footer-info .label {
            font-weight: 600;
            color: ${bgInfo.accentTextColor};
          }
          
          .signature-container {
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .signature-image {
            width: 120px;
            margin-bottom: 8px;
          }
          .signature-name {
            font-size: 14px;
            font-weight: bold;
            color: #333;
          }
          .signature-title {
            font-size: 12px;
            color: #555;
          }
          
          .qr-code {
            border: 2px solid ${accentColor}30;
            padding: 4px;
            border-radius: 6px;
            background: white;
            box-shadow: 0 2px 8px ${accentColor}20;
          }
          .qr-code-text {
            font-size: 10px;
            color: ${bgInfo.accentTextColor};
            font-weight: 500;
            margin-top: 4px;
          }
          
          .certificate-footer {
            margin-top: 16px;
            font-size: 12px;
            color: ${bgInfo.accentTextColor};
            text-align: center;
          }
          .certificate-footer .framework-name {
            display: inline-block;
            font-style: italic;
            font-weight: 500;
            margin: 0 4px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="corner-top-left"></div>
          <div class="corner-top-right"></div>
          <div class="corner-bottom-left"></div>
          <div class="corner-bottom-right"></div>
          
          <div class="inner-content">
            <div class="header">
              <img src="${logoBase64}" alt="Framework Pro Logo" class="logo">
              <h1 class="title">Certificate of Completion</h1>
              <p class="subtitle">Professional Business Framework Mastery</p>
              <div class="verified-badge">✓ Verified Certificate</div>
            </div>
            
            <div class="content">
              <p class="name">${user.name || user.username}</p>
              <div class="description-container">
                <p class="description">${certificate.description}</p>
              </div>
            </div>
            
            <div class="signature-container">
              <div class="signature">
                <img src="${signatureBase64}" alt="Signature" class="signature-image">
                <p class="signature-name">Manas Kumar</p>
                <p class="signature-title">CEO & Platform Director</p>
              </div>
              
              <div class="qr-code">
                <img src="/api/static/images/qr-placeholder.png" width="80" height="80" alt="QR Code for Verification">
                <p class="qr-code-text">Scan to verify</p>
              </div>
            </div>
            
            <div class="footer-info">
              <div>
                <p class="label">Issue Date</p>
                <p>${certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </div>
              <div style="text-align: right;">
                <p class="label">Certificate #</p>
                <p>${certificate.certificateNumber}</p>
              </div>
            </div>
            
            <div class="certificate-footer">
              This certificate verifies mastery of the 
              <span class="framework-name">${framework.name}</span> 
              framework and its professional business applications.
            </div>
          </div>
        </div>
      </body>
      </html>
      `;
      
      // Set response headers
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.certificateNumber}.html"`);
      
      // Send the HTML certificate
      res.send(certificateHtml);
    } catch (error) {
      next(error);
    }
  });
  
  // Set up WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients by exercise ID
  const exerciseRooms: Record<string, Map<string, WebSocket>> = {};
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    let userId: number | null = null;
    let exerciseId: number | null = null;
    let username: string | null = null;
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch(data.type) {
          case 'join':
            // User joins an exercise collaboration room
            userId = data.userId;
            exerciseId = data.exerciseId;
            username = data.username;
            
            // Create room if it doesn't exist
            if (!exerciseRooms[exerciseId]) {
              exerciseRooms[exerciseId] = new Map();
            }
            
            // Add user to room
            const clientId = `${userId}-${Date.now()}`;
            exerciseRooms[exerciseId].set(clientId, ws);
            
            // Notify other users in the room
            broadcastToRoom(exerciseId, {
              type: 'user-joined',
              userId,
              username,
              timestamp: new Date().toISOString(),
              users: getActiveUsers(exerciseId)
            }, ws);
            
            // Send join confirmation to the user
            ws.send(JSON.stringify({
              type: 'joined',
              exerciseId,
              users: getActiveUsers(exerciseId)
            }));
            
            break;
            
          case 'leave':
            // User leaves the exercise room
            if (exerciseId && exerciseRooms[exerciseId]) {
              // Find and remove the user from the room
              for (const [clientId, client] of exerciseRooms[exerciseId].entries()) {
                if (client === ws) {
                  exerciseRooms[exerciseId].delete(clientId);
                  break;
                }
              }
              
              // Notify others that user left
              broadcastToRoom(exerciseId, {
                type: 'user-left',
                userId,
                username,
                timestamp: new Date().toISOString(),
                users: getActiveUsers(exerciseId)
              });
              
              // Clean up empty rooms
              if (exerciseRooms[exerciseId].size === 0) {
                delete exerciseRooms[exerciseId];
              }
            }
            break;
            
          case 'update-solution':
            // User updates their solution
            if (exerciseId && exerciseRooms[exerciseId]) {
              // Broadcast the solution update to all users in the room
              broadcastToRoom(exerciseId, {
                type: 'solution-updated',
                userId,
                username,
                solution: data.solution,
                timestamp: new Date().toISOString()
              });
            }
            break;
            
          case 'comment':
            // User adds a comment
            if (exerciseId && exerciseRooms[exerciseId]) {
              // Broadcast the comment to all users in the room
              broadcastToRoom(exerciseId, {
                type: 'new-comment',
                userId,
                username,
                comment: data.comment,
                timestamp: new Date().toISOString()
              });
            }
            break;
            
          case 'ping':
            // Respond to ping with pong to keep connection alive
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      // Handle user disconnection
      if (exerciseId && exerciseRooms[exerciseId]) {
        // Find and remove the user from the room
        for (const [clientId, client] of exerciseRooms[exerciseId].entries()) {
          if (client === ws) {
            exerciseRooms[exerciseId].delete(clientId);
            break;
          }
        }
        
        // Notify others that user left
        broadcastToRoom(exerciseId, {
          type: 'user-left',
          userId,
          username,
          timestamp: new Date().toISOString(),
          users: getActiveUsers(exerciseId)
        });
        
        // Clean up empty rooms
        if (exerciseRooms[exerciseId].size === 0) {
          delete exerciseRooms[exerciseId];
        }
      }
    });
  });
  
  // Helper function to broadcast a message to all clients in an exercise room
  function broadcastToRoom(exerciseId: number, message: any, excludeClient?: WebSocket) {
    if (!exerciseRooms[exerciseId]) return;
    
    const messageStr = JSON.stringify(message);
    
    exerciseRooms[exerciseId].forEach((client) => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
  
  // Helper function to get list of active users in a room
  function getActiveUsers(exerciseId: number): Array<{userId: number, username: string}> {
    if (!exerciseRooms[exerciseId]) return [];
    
    const users = new Map<number, string>();
    
    exerciseRooms[exerciseId].forEach((_, clientId) => {
      const userId = parseInt(clientId.split('-')[0], 10);
      const username = clientId.split('-')[1] || 'Anonymous';
      users.set(userId, username);
    });
    
    return Array.from(users.entries()).map(([userId, username]) => ({ userId, username }));
  }
  
  return httpServer;
}
