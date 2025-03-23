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
  apiKey: text("api_key"),
  aiProvider: text("ai_provider"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  apiKey: true,
  aiProvider: true,
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
});

export const insertFrameworkSchema = createInsertSchema(frameworks).pick({
  name: true,
  description: true,
  level: true,
  duration: true,
  status: true,
  case_studies: true,
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
  completed: boolean("completed").default(false),
  order: integer("order").notNull(),
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
  completed: true,
  order: true,
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

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).pick({
  userId: true,
  quizId: true,
  score: true,
  maxScore: true,
  answers: true,
  timeTaken: true,
  passed: true,
  completedAt: true,
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
