import { trainingData, conversations, projects, experiences, promptExamples, type TrainingData, type InsertTrainingData, type Conversation, type InsertConversation, type Project, type InsertProject, type Experience, type InsertExperience, type PromptExample, type InsertPromptExample } from "../shared/schema";
import { db } from "./db";
import { desc, eq, asc } from "drizzle-orm";

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
  addPromptExample(example: InsertPromptExample): Promise<PromptExample>;
  getAllPromptExamples(): Promise<PromptExample[]>;
  getActivePromptExamples(): Promise<PromptExample[]>;
  updatePromptExample(id: number, example: InsertPromptExample): Promise<PromptExample>;
  deletePromptExample(id: number): Promise<void>;
  initializePromptExamples(): Promise<void>;
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

  async initializePromptExamples(): Promise<void> {
    const existingExamples = await this.getAllPromptExamples();
    if (existingExamples.length === 0) {
      const defaultExamples = [
        {
          question: "안녕하세요! 어떤 일을 하고 계신가요?",
          responseType: "ai",
          isActive: true,
          displayOrder: 1
        },
        {
          question: "어떤 기술 스택을 사용하시나요?",
          responseType: "ai",
          isActive: true,
          displayOrder: 2
        },
        {
          question: "현재 진행 중인 프로젝트가 있나요?",
          responseType: "projects",
          isActive: true,
          displayOrder: 3
        },
        {
          question: "개발자로서의 경험에 대해 말씀해주세요",
          responseType: "experiences",
          isActive: true,
          displayOrder: 4
        },
        {
          question: "새로운 기술 학습은 어떻게 하시나요?",
          responseType: "ai",
          isActive: true,
          displayOrder: 5
        },
        {
          question: "연락하고 싶은데 어떻게 연락하면 될까요?",
          responseType: "contacts",
          isActive: true,
          displayOrder: 6
        },
        {
          question: "어떤 기술 스택과 스킬을 가지고 계시나요?",
          responseType: "skills",
          isActive: true,
          displayOrder: 7
        }
      ];

      for (const example of defaultExamples) {
        await this.addPromptExample(example);
      }
    }
  }
}

export const storage = new DatabaseStorage();