import { trainingData, conversations, projects, experiences, type TrainingData, type InsertTrainingData, type Conversation, type InsertConversation, type Project, type InsertProject, type Experience, type InsertExperience } from "../shared/schema";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  addTrainingData(data: InsertTrainingData): Promise<TrainingData>;
  getAllTrainingData(): Promise<TrainingData[]>;
  deleteTrainingData(id: number): Promise<void>;
  addConversation(conversation: InsertConversation): Promise<Conversation>;
  getRecentConversations(limit?: number): Promise<Conversation[]>;
  addProject(project: InsertProject): Promise<Project>;
  getAllProjects(): Promise<Project[]>;
  updateProject(id: number, project: InsertProject): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  initializeProjects(): Promise<void>;
  addExperience(experience: InsertExperience): Promise<Experience>;
  getAllExperiences(): Promise<Experience[]>;
  updateExperience(id: number, experience: InsertExperience): Promise<Experience>;
  deleteExperience(id: number): Promise<void>;
  initializeExperiences(): Promise<void>;
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

  async initializeProjects(): Promise<void> {
    const existingProjects = await this.getAllProjects();
    if (existingProjects.length === 0) {
      const projectsData = [
        {
          title: "Myoungji University Lecture Registration App",
          period: "March 2022 - June 2022",
          subtitle: "Individual",
          summary: "Myongji University's lecture registration Android application.",
          contents: ["Conducted from UX design such as problem definition, user research, and UX modeling to full development."],
          tech: "Android studio / Kotlin / SQLite",
          img: "/myoungji_logo.png",
          imgAlt: "Myoungji Logo",
          moreLink: "https://github.com/ahnsunnyyoung/mju_applying_lecture_app",
          width: "47%"
        },
        {
          title: "JjinMotJib",
          period: "March 2022 - June 2022",
          subtitle: "Team (Frontend Developer)",
          summary: "AI advertising filtering service website for restaurant search engine web application",
          contents: [
            "Worked with an Agile methodology.",
            "Applied various user interaction animation effects and dark mode."
          ],
          tech: "React / Javascript / AWS EC2 / Agile",
          img: "/jjinmotjib_logo.png",
          imgAlt: "Jjinmotjib Logo",
          moreLink: "https://github.com/ahnsunnyyoung/capstone_frontend",
          width: "47%"
        },
        {
          title: "Today's COVID-19",
          period: "July 2020",
          subtitle: "Team (Frontend Developer)",
          summary: "COVID-19 information mobile application.",
          contents: [
            "Applied intuitive colors and interactive icons so that users can easily check COVID-19 information."
          ],
          tech: "React / Javascript / Expo",
          img: "/covid_logo.png",
          imgAlt: "Covid Logo",
          moreLink: "https://github.com/ahnsunnyyoung/today_covid19",
          width: "47%"
        }
      ];

      for (const projectData of projectsData) {
        await this.addProject(projectData);
      }
    }
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

  async initializeExperiences(): Promise<void> {
    const existingExperiences = await this.getAllExperiences();
    if (existingExperiences.length === 0) {
      const defaultExperiences = [
        {
          company: "Tech Solutions Inc.",
          position: "Frontend Developer",
          period: "2023 - Present",
          location: "Seoul, South Korea",
          description: "Developing modern web applications using React and TypeScript with focus on user experience and performance optimization.",
          responsibilities: [
            "Built responsive web applications using React and TypeScript",
            "Implemented state management with Redux and Context API",
            "Collaborated with design team to create intuitive user interfaces",
            "Optimized application performance and accessibility"
          ],
          skills: "React / TypeScript / Redux / CSS / JavaScript"
        }
      ];

      for (const experience of defaultExperiences) {
        await this.addExperience(experience);
      }
    }
  }
}

export const storage = new DatabaseStorage();