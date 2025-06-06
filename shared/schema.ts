import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trainingData = pgTable("training_data", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  period: text("period").notNull(),
  subtitle: text("subtitle").notNull(),
  summary: text("summary").notNull(),
  contents: text("contents").array().notNull(),
  tech: text("tech").notNull(),
  img: text("img").notNull(),
  imgAlt: text("img_alt").notNull(),
  moreLink: text("more_link"),
  width: text("width").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  position: text("position").notNull(),
  period: text("period").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  responsibilities: text("responsibilities").array(),
  skills: text("skills"),
  website: text("website"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const promptExamples = pgTable("prompt_examples", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  responseType: text("response_type").default("ai").notNull(), // "ai", "projects", "experiences"
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: serial("display_order").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertTrainingDataSchema = createInsertSchema(trainingData).pick({
  content: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  question: true,
  answer: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  title: true,
  period: true,
  subtitle: true,
  summary: true,
  contents: true,
  tech: true,
  img: true,
  imgAlt: true,
  moreLink: true,
  width: true,
});

export const insertExperienceSchema = createInsertSchema(experiences).pick({
  company: true,
  position: true,
  period: true,
  location: true,
  description: true,
  responsibilities: true,
  skills: true,
  website: true,
});

export const insertPromptExampleSchema = createInsertSchema(promptExamples).pick({
  question: true,
  responseType: true,
  isActive: true,
  displayOrder: true,
});

export type InsertTrainingData = z.infer<typeof insertTrainingDataSchema>;
export type TrainingData = typeof trainingData.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type PromptExample = typeof promptExamples.$inferSelect;
export type InsertPromptExample = z.infer<typeof insertPromptExampleSchema>;
