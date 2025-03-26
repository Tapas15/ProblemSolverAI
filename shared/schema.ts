import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("user"), // 'user' or 'admin'
  apiKey: text("api_key"),
  aiProvider: text("ai_provider"),
  userPreferences: text("user_preferences"),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  bio: text("bio"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorBackupCodes: text("two_factor_backup_codes"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  apiKey: true,
  aiProvider: true,
  userPreferences: true,
  avatarUrl: true,
  phone: true,
  bio: true,
  twoFactorEnabled: true,
  twoFactorSecret: true,
  twoFactorBackupCodes: true,
});

// Framework schema
export const frameworks = pgTable("frameworks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(), // beginner, intermediate, advanced
  duration: integer("duration").notNull(), // in minutes
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  case_studies: text("case_studies"), // Detailed case studies with examples
  image_url: text("image_url"), // URL to framework featured image
});

export const insertFrameworkSchema = createInsertSchema(frameworks).pick({
  name: true,
  description: true,
  level: true,
  duration: true,
  status: true,
  case_studies: true,
  image_url: true,
});

// Module schema
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  frameworkId: integer("framework_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  content: text("content"), // Detailed HTML/markdown content
  examples: text("examples"), // Practical examples
  keyTakeaways: text("key_takeaways"), // Key points to remember
  quizQuestions: text("quiz_questions"), // JSON string of quiz questions
  videoUrl: text("video_url"), // URL to video content if any
  resources: text("resources"), // Additional learning resources
  image_url: text("image_url"), // URL to module featured image
  completed: boolean("completed").default(false),
  order: integer("order").notNull(),
  scormPath: text("scorm_path"), // Path to SCORM package index.html
});

export const insertModuleSchema = createInsertSchema(modules).pick({
  frameworkId: true,
  name: true,
  description: true,
  content: true,
  examples: true,
  keyTakeaways: true,
  quizQuestions: true,
  videoUrl: true,
  resources: true,
  image_url: true,
  completed: true,
  order: true,
  scormPath: true,
});

// User Progress schema
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  frameworkId: integer("framework_id").notNull(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  completedModules: integer("completed_modules").default(0),
  totalModules: integer("total_modules").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  frameworkId: true,
  status: true,
  completedModules: true,
  totalModules: true,
});

// AI Conversation schema
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  frameworkId: integer("framework_id"),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).pick({
  userId: true,
  frameworkId: true,
  question: true,
  answer: true,
});

// Quiz schema
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  frameworkId: integer("framework_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: text("level").notNull(), // beginner, intermediate, advanced
  questions: text("questions").notNull(), // JSON string of quiz questions
  timeLimit: integer("time_limit"), // in minutes, optional
  passingScore: integer("passing_score"), // percentage required to pass
  isActive: boolean("is_active").default(true),
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  frameworkId: true,
  title: true,
  description: true,
  level: true,
  questions: true,
  timeLimit: true,
  passingScore: true,
  isActive: true,
});

// Quiz Attempts schema
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizId: integer("quiz_id").notNull(),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  answers: text("answers").notNull(), // JSON string of user answers
  timeTaken: integer("time_taken"), // in seconds
  completedAt: timestamp("completed_at").defaultNow(),
  passed: boolean("passed").notNull(),
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts)
  .pick({
    quizId: true,
    userId: true,  // Include userId in the schema
    score: true,
    maxScore: true,
    answers: true,
    timeTaken: true,
    passed: true,
  })
  // Make completedAt optional as it'll be handled on the server
  .extend({
    completedAt: z.date().optional()
  });

// xAPI Statements schema
export const xapiStatements = pgTable("xapi_statements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  verb: text("verb").notNull(), // e.g., "completed", "attempted", "experienced"
  object: text("object").notNull(), // The activity or thing being interacted with
  objectType: text("object_type").notNull(), // e.g., "module", "quiz", "framework"
  objectId: integer("object_id").notNull(), // ID of the related object
  result: text("result"), // JSON string with score, success, etc.
  context: text("context"), // JSON string with contextual information
  timestamp: timestamp("timestamp").defaultNow(),
  stored: boolean("stored").default(false), // Whether it's been sent to an LRS
});

export const insertXapiStatementSchema = createInsertSchema(xapiStatements).pick({
  userId: true,
  verb: true,
  object: true,
  objectType: true,
  objectId: true,
  result: true,
  context: true,
});

// SCORM Tracking schema
export const scormTrackingData = pgTable("scorm_tracking_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  scoId: text("sco_id").notNull(), // Shareable Content Object ID
  elementName: text("element_name").notNull(), // SCORM data model element name
  elementValue: text("element_value").notNull(), // The value of the element
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertScormTrackingDataSchema = createInsertSchema(scormTrackingData).pick({
  userId: true,
  scoId: true,
  elementName: true,
  elementValue: true,
});

// LRS Configuration schema (Learning Record Store)
export const lrsConfigurations = pgTable("lrs_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  endpoint: text("endpoint").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  isActive: boolean("is_active").default(true),
});

export const insertLrsConfigurationSchema = createInsertSchema(lrsConfigurations).pick({
  name: true,
  endpoint: true,
  username: true,
  password: true,
  isActive: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFramework = z.infer<typeof insertFrameworkSchema>;
export type Framework = typeof frameworks.$inferSelect;

export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

export type InsertXapiStatement = z.infer<typeof insertXapiStatementSchema>;
export type XapiStatement = typeof xapiStatements.$inferSelect;

export type InsertScormTrackingData = z.infer<typeof insertScormTrackingDataSchema>;
export type ScormTrackingData = typeof scormTrackingData.$inferSelect;

export type InsertLrsConfiguration = z.infer<typeof insertLrsConfigurationSchema>;
export type LrsConfiguration = typeof lrsConfigurations.$inferSelect;

// Interactive Exercises schema
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  frameworkId: integer("framework_id").notNull(),
  moduleId: integer("module_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  scenario: text("scenario").notNull(), // Real-world problem scenario
  steps: text("steps").notNull(), // JSON string of step-by-step instructions
  sampleSolution: text("sample_solution"), // Example solution for reference
  difficulty: text("difficulty").notNull().default("intermediate"), // beginner, intermediate, advanced
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  resources: text("resources"), // Additional resources for exercise completion
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  frameworkId: true,
  moduleId: true,
  title: true,
  description: true,
  scenario: true,
  steps: true,
  sampleSolution: true,
  difficulty: true,
  estimatedTime: true,
  resources: true,
});

// User Exercise Submissions schema
export const exerciseSubmissions = pgTable("exercise_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  solution: text("solution").notNull(), // User's solution to the exercise
  feedback: text("feedback"), // AI or instructor feedback on the solution
  status: text("status").notNull().default("submitted"), // submitted, reviewed, completed
  score: integer("score"), // Optional scoring (1-100)
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertExerciseSubmissionSchema = createInsertSchema(exerciseSubmissions).pick({
  userId: true,
  exerciseId: true,
  solution: true,
  feedback: true,
  status: true,
  score: true,
});

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertExerciseSubmission = z.infer<typeof insertExerciseSubmissionSchema>;
export type ExerciseSubmission = typeof exerciseSubmissions.$inferSelect;

// Certificates schema
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  frameworkId: integer("framework_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  issueDate: timestamp("issue_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  certificateNumber: text("certificate_number").notNull().unique(),
  status: text("status").notNull().default("active"), // active, expired, revoked
  imageUrl: text("image_url"), // URL to certificate template/image
  achievements: text("achievements"), // JSON string describing achievements that led to this certificate
  metaData: text("meta_data"), // Additional information about the certificate
});

export const insertCertificateSchema = createInsertSchema(certificates).pick({
  userId: true,
  frameworkId: true,
  title: true,
  description: true,
  expiryDate: true,
  certificateNumber: true,
  status: true,
  imageUrl: true,
  achievements: true,
  metaData: true,
});

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

// Rewards schema
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'badge', 'points', 'streak', 'achievement'
  iconUrl: text("icon_url"), // URL to reward icon
  pointValue: integer("point_value").default(0), // Points value (if applicable)
  condition: text("condition").notNull(), // JSON describing trigger conditions
  rarity: text("rarity").default("common"), // 'common', 'uncommon', 'rare', 'epic', 'legendary'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  name: true,
  description: true,
  type: true,
  iconUrl: true,
  pointValue: true,
  condition: true,
  rarity: true,
});

// User Rewards schema
export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  data: text("data"), // Additional data about how reward was earned
});

export const insertUserRewardSchema = createInsertSchema(userRewards).pick({
  userId: true,
  rewardId: true,
  data: true,
});

// User Streaks
export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
  streakStartDate: timestamp("streak_start_date").defaultNow(),
});

export const insertUserStreakSchema = createInsertSchema(userStreaks).pick({
  userId: true,
  currentStreak: true,
  longestStreak: true,
  lastActivityDate: true,
  streakStartDate: true,
});

export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;
export type UserReward = typeof userRewards.$inferSelect;

export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type UserStreak = typeof userStreaks.$inferSelect;
