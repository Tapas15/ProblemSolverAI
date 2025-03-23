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
  caseStudies: text("case_studies"), // Detailed case studies with examples
});

export const insertFrameworkSchema = createInsertSchema(frameworks).pick({
  name: true,
  description: true,
  level: true,
  duration: true,
  status: true,
  caseStudies: true,
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
