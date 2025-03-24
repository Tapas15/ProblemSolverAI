import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertAiConversationSchema, AiConversation,
  insertQuizSchema, insertQuizAttemptSchema,
  insertXapiStatementSchema, insertLrsConfigurationSchema,
  XapiStatement,
  insertExerciseSchema, insertExerciseSubmissionSchema,
  Exercise, ExerciseSubmission
} from "@shared/schema";
import OpenAI from "openai";
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
      
      // Get user's AI conversations
      const aiConversations = await storage.getAiConversations(req.user.id);
      
      // Compile all data
      const userData = {
        userInfo,
        progressData,
        quizAttempts,
        aiConversations,
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
  app.patch("/api/user/ai-settings", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).send("Unauthorized");
      }
      
      const updateSchema = z.object({
        apiKey: z.string().optional(),
        aiProvider: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user.id, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Update user in session
      req.login(updatedUser, (err) => {
        if (err) return next(err);
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Update user password
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
  
  // Update user privacy settings
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
  
  // Update user notification settings
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
  
  // AI Assistant routes
  app.post("/api/ai/ask", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { question, frameworkId } = req.body;
      const userId = req.user!.id;
      
      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user || !user.apiKey) {
        return res.status(400).json({ message: "API key not configured. Please set up your AI integration in settings." });
      }
      
      let answer = "";
      const aiProvider = user.aiProvider || "openai";
      
      if (aiProvider === "openai") {
        // Use OpenAI API
        try {
          const openai = new OpenAI({ apiKey: user.apiKey });
          // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are an AI assistant for the QuestionPro AI platform, specializing in business problem-solving frameworks. ${
                  frameworkId ? `The user is currently working with a specific framework (ID: ${frameworkId}).` : 
                  "Provide helpful, clear, and concise guidance on applying business frameworks to solve real-world problems."
                } Format your responses in a structured way with clear steps and explanations.`
              },
              {
                role: "user",
                content: question
              }
            ],
          });
          
          answer = response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try again.";
        } catch (error: any) {
          console.error("OpenAI API error:", error);
          return res.status(500).json({ message: `AI provider error: ${error.message}` });
        }
      } else {
        return res.status(400).json({ message: "Unsupported AI provider" });
      }
      
      // Store the conversation
      const conversation = await storage.createAiConversation({
        userId,
        frameworkId: frameworkId || null,
        question,
        answer
      });
      
      // Invalidate conversations cache
      invalidateCache(CACHE_KEYS.AI_CONVERSATIONS(userId));
      
      res.json(conversation);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/ai/conversations", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      
      // Check cache first
      const cacheKey = CACHE_KEYS.AI_CONVERSATIONS(userId);
      const cachedConversations = getCachedData<AiConversation[]>(cacheKey);
      
      if (cachedConversations) {
        return res.json(cachedConversations);
      }
      
      // If not in cache, fetch from storage
      const conversations = await storage.getAiConversations(userId);
      
      // Cache the result for 5 minutes
      cacheData(cacheKey, conversations, 300);
      
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  });
  
  // Clear all AI conversations for the current user
  app.delete("/api/ai/conversations", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      
      // Get all of the user's conversations
      const conversations = await storage.getAiConversations(userId);
      
      // In a real database implementation, we would do this with a single query
      // For memory storage, we need to delete them one by one
      for (const conversation of conversations) {
        await storage.deleteAiConversation(conversation.id);
      }
      
      // Invalidate the AI conversations cache
      invalidateCache(CACHE_KEYS.AI_CONVERSATIONS(userId));
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
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
      
      // Check cache first
      const cacheKey = CACHE_KEYS.USER_QUIZ_ATTEMPTS(userId);
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
      
      const attempts = await storage.getUserQuizAttempts(userId);
      
      // Cache the attempts data
      cacheData(cacheKey, attempts);
      res.json(attempts);
    } catch (error) {
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
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Add userId to the body before validation
      const requestDataWithUserId = {
        ...req.body,
        userId: req.user!.id
      };
      
      // Validate attempt data
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
                email: req.user.email || `${req.user.username}@questionpro.ai`
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
          email: user.email || `${user.username}@questionpro.ai`
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
      
      // Invalidate module cache
      invalidateCache(CACHE_KEYS.MODULE(moduleId));
      
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
                email: user.email || `${user.username}@questionpro.ai`
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
                  email: user.email || `${user.username}@questionpro.ai`
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

  const httpServer = createServer(app);
  return httpServer;
}
