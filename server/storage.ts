import { trainingData, conversations, type TrainingData, type InsertTrainingData, type Conversation, type InsertConversation } from "../shared/schema";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  addTrainingData(data: InsertTrainingData): Promise<TrainingData>;
  getAllTrainingData(): Promise<TrainingData[]>;
  deleteTrainingData(id: number): Promise<void>;
  addConversation(conversation: InsertConversation): Promise<Conversation>;
  getRecentConversations(limit?: number): Promise<Conversation[]>;
}

export class DatabaseStorage implements IStorage {
  async addTrainingData(data: InsertTrainingData): Promise<TrainingData> {
    const [result] = await db
      .insert(trainingData)
      .values(data)
      .returning();
    return result;
  }

  async getAllTrainingData(): Promise<TrainingData[]> {
    return await db
      .select()
      .from(trainingData)
      .orderBy(desc(trainingData.timestamp));
  }

  async deleteTrainingData(id: number): Promise<void> {
    await db
      .delete(trainingData)
      .where(eq(trainingData.id, id));
  }

  async addConversation(conversation: InsertConversation): Promise<Conversation> {
    const [result] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return result;
  }

  async getRecentConversations(limit: number = 10): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.timestamp))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
