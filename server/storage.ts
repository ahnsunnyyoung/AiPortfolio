import { trainingData, conversations, projects, experiences, promptExamples, contacts, skillCategories, skills, introduction, translations, type TrainingData, type InsertTrainingData, type Conversation, type InsertConversation, type Project, type InsertProject, type Experience, type InsertExperience, type PromptExample, type InsertPromptExample, type Contact, type InsertContact, type SkillCategory, type InsertSkillCategory, type Skill, type InsertSkill, type Introduction, type InsertIntroduction, type Translation, type InsertTranslation } from "../shared/schema";
import { db } from "./db";
import { desc, eq, asc, and } from "drizzle-orm";
import { isNull } from "drizzle-orm";

export interface IStorage {
  addTrainingData(data: InsertTrainingData): Promise<TrainingData>;
  getAllTrainingData(): Promise<TrainingData[]>;
  getActiveTrainingData(): Promise<TrainingData[]>;
  updateTrainingData(id: number, data: InsertTrainingData): Promise<TrainingData>;
  deleteTrainingData(id: number): Promise<void>;
  addConversation(conversation: InsertConversation): Promise<Conversation>;
  getRecentConversations(limit?: number): Promise<Conversation[]>;
  getAllConversations(): Promise<Conversation[]>;
  addProject(project: InsertProject): Promise<Project>;
  getAllProjects(): Promise<Project[]>;
  updateProject(id: number, project: InsertProject): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  addExperience(experience: InsertExperience): Promise<Experience>;
  getAllExperiences(): Promise<Experience[]>;
  updateExperience(id: number, experience: InsertExperience): Promise<Experience>;
  deleteExperience(id: number): Promise<void>;
  addPromptExample(example: InsertPromptExample): Promise<PromptExample>;
  getAllPromptExamples(): Promise<PromptExample[]>;
  getActivePromptExamples(): Promise<PromptExample[]>;
  updatePromptExample(id: number, example: InsertPromptExample): Promise<PromptExample>;
  deletePromptExample(id: number): Promise<void>;
  // Contacts management
  getContact(): Promise<Contact | undefined>;
  updateContact(contact: InsertContact): Promise<Contact>;
  // Skills management
  getAllSkillCategories(): Promise<SkillCategory[]>;
  addSkillCategory(category: InsertSkillCategory): Promise<SkillCategory>;
  updateSkillCategory(id: number, category: InsertSkillCategory): Promise<SkillCategory>;
  deleteSkillCategory(id: number): Promise<void>;
  getAllSkills(): Promise<Skill[]>;
  getSkillsByCategory(categoryId: number): Promise<Skill[]>;
  addSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: InsertSkill): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;
  // Introduction management
  getIntroduction(): Promise<Introduction | undefined>;
  updateIntroduction(data: InsertIntroduction): Promise<Introduction>;
  // Translation management
  getCachedTranslation(originalText: string, language: string, context?: string): Promise<Translation | undefined>;
  addTranslation(translation: InsertTranslation): Promise<Translation>;
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

  async getActiveTrainingData(): Promise<TrainingData[]> {
    return await db
      .select()
      .from(trainingData)
      .where(eq(trainingData.isActive, true))
      .orderBy(desc(trainingData.timestamp));
  }

  async updateTrainingData(id: number, data: InsertTrainingData): Promise<TrainingData> {
    const [updated] = await db
      .update(trainingData)
      .set(data)
      .where(eq(trainingData.id, id))
      .returning();
    return updated;
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

  async getAllConversations(): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.timestamp));
  }

  async addProject(project: InsertProject): Promise<Project> {
    const [result] = await db
      .insert(projects)
      .values(project)
      .returning();
    return result;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .orderBy(desc(projects.timestamp));
  }

  async updateProject(id: number, project: InsertProject): Promise<Project> {
    const [result] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return result;
  }

  async deleteProject(id: number): Promise<void> {
    await db
      .delete(projects)
      .where(eq(projects.id, id));
  }


  async addExperience(experience: InsertExperience): Promise<Experience> {
    const [result] = await db
      .insert(experiences)
      .values(experience)
      .returning();
    return result;
  }

  async getAllExperiences(): Promise<Experience[]> {
    return await db
      .select()
      .from(experiences)
      .orderBy(desc(experiences.timestamp));
  }

  async updateExperience(id: number, experience: InsertExperience): Promise<Experience> {
    const [result] = await db
      .update(experiences)
      .set(experience)
      .where(eq(experiences.id, id))
      .returning();
    return result;
  }

  async deleteExperience(id: number): Promise<void> {
    await db
      .delete(experiences)
      .where(eq(experiences.id, id));
  }

  async addPromptExample(example: InsertPromptExample): Promise<PromptExample> {
    const [result] = await db
      .insert(promptExamples)
      .values(example)
      .returning();
    return result;
  }

  async getAllPromptExamples(): Promise<PromptExample[]> {
    return await db
      .select()
      .from(promptExamples)
      .orderBy(asc(promptExamples.displayOrder), desc(promptExamples.timestamp));
  }

  async getActivePromptExamples(): Promise<PromptExample[]> {
    return await db
      .select()
      .from(promptExamples)
      .where(eq(promptExamples.isActive, true))
      .orderBy(asc(promptExamples.displayOrder), desc(promptExamples.timestamp));
  }

  async updatePromptExample(id: number, example: InsertPromptExample): Promise<PromptExample> {
    const [result] = await db
      .update(promptExamples)
      .set(example)
      .where(eq(promptExamples.id, id))
      .returning();
    return result;
  }

  async deletePromptExample(id: number): Promise<void> {
    await db
      .delete(promptExamples)
      .where(eq(promptExamples.id, id));
  }



  // Contact management methods
  async getContact(): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).limit(1);
    return contact || undefined;
  }

  async updateContact(contactData: InsertContact): Promise<Contact> {
    const existingContact = await this.getContact();

    if (existingContact) {
      const [updated] = await db
        .update(contacts)
        .set(contactData)
        .where(eq(contacts.id, existingContact.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(contacts)
        .values(contactData)
        .returning();
      return created;
    }
  }

  // Skills management methods
  async getAllSkillCategories(): Promise<SkillCategory[]> {
    return db.select().from(skillCategories).orderBy(asc(skillCategories.displayOrder));
  }

  async addSkillCategory(category: InsertSkillCategory): Promise<SkillCategory> {
    const [created] = await db
      .insert(skillCategories)
      .values(category)
      .returning();
    return created;
  }

  async updateSkillCategory(id: number, category: InsertSkillCategory): Promise<SkillCategory> {
    const [updated] = await db
      .update(skillCategories)
      .set(category)
      .where(eq(skillCategories.id, id))
      .returning();
    return updated;
  }

  async deleteSkillCategory(id: number): Promise<void> {
    // First delete all skills in this category
    await db.delete(skills).where(eq(skills.categoryId, id));
    // Then delete the category
    await db.delete(skillCategories).where(eq(skillCategories.id, id));
  }

  async getAllSkills(): Promise<Skill[]> {
    return db.select().from(skills).orderBy(asc(skills.categoryId), asc(skills.displayOrder));
  }

  async getSkillsByCategory(categoryId: number): Promise<Skill[]> {
    return db.select().from(skills)
      .where(eq(skills.categoryId, categoryId))
      .orderBy(asc(skills.displayOrder));
  }

  async addSkill(skill: InsertSkill): Promise<Skill> {
    const [created] = await db
      .insert(skills)
      .values(skill)
      .returning();
    return created;
  }

  async updateSkill(id: number, skill: InsertSkill): Promise<Skill> {
    const [updated] = await db
      .update(skills)
      .set(skill)
      .where(eq(skills.id, id))
      .returning();
    return updated;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  async getIntroduction(): Promise<Introduction | undefined> {
    const [intro] = await db.select().from(introduction).where(eq(introduction.isActive, true)).limit(1);
    return intro || undefined;
  }

  async updateIntroduction(data: InsertIntroduction): Promise<Introduction> {
    // First, deactivate all existing introductions
    await db.update(introduction).set({ isActive: false });

    // Then create a new active introduction
    const [created] = await db
      .insert(introduction)
      .values({ ...data, isActive: true })
      .returning();
    return created;
  }

  async getCachedTranslation(originalText: string, language: string, context?: string): Promise<Translation | undefined> {
    const conditions = [
      eq(translations.originalText, originalText),
      eq(translations.language, language)
    ];

    if (context) {
      conditions.push(eq(translations.context, context));
    }

    const [result] = await db
      .select()
      .from(translations)
      .where(and(...conditions))
      .limit(1);

    return result;
  }

  async addTranslation(translation: InsertTranslation): Promise<Translation> {
    const [result] = await db
      .insert(translations)
      .values(translation)
      .returning();
    return result;
  }

  async migrateConversationsToSessions(): Promise<void> {
    // Get all conversations without sessionId
    const conversationsWithoutSession = await db
      .select()
      .from(conversations)
      .where(isNull(conversations.sessionId))
      .orderBy(conversations.timestamp);

    if (conversationsWithoutSession.length === 0) return;

    let currentSessionId = `legacy_session_${Date.now()}`;
    let lastTimestamp: Date | null = null;

    for (const conversation of conversationsWithoutSession) {
      const convTimestamp = new Date(conversation.timestamp);

      // Create new session if gap is more than 30 minutes
      if (lastTimestamp) {
        const timeDiff = convTimestamp.getTime() - lastTimestamp.getTime();
        if (timeDiff > 30 * 60 * 1000) { // 30 minutes
          currentSessionId = `legacy_session_${convTimestamp.getTime()}`;
        }
      }

      // Update conversation with session ID
      await db
        .update(conversations)
        .set({ sessionId: currentSessionId })
        .where(eq(conversations.id, conversation.id));

      lastTimestamp = convTimestamp;
    }
  }
}

export const storage = new DatabaseStorage();