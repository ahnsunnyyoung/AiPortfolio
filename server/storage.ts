import { trainingData, conversations, projects, type TrainingData, type InsertTrainingData, type Conversation, type InsertConversation, type Project, type InsertProject } from "../shared/schema";
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
  deleteProject(id: number): Promise<void>;
  initializeProjects(): Promise<void>;
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
          img: "/todayscovid19_logo.png",
          imgAlt: "Today's Covid-19 Logo",
          width: "20%"
        },
        {
          title: "StockSunny",
          period: "March 2020 - June 2020",
          subtitle: "Individual",
          summary: "Real-time stock data cross platform application.",
          contents: [
            "Developed an application that provides stock information in real-time live streams.",
            "Provides stock information visually in various graphs."
          ],
          tech: "React-Redux / React Native / Javascript",
          img: "/stocksunny_logo.png",
          imgAlt: "Stock Sunny Logo",
          moreLink: "https://github.com/ahnsunnyyoung/react-native-stocksunny",
          width: "20%"
        },
        {
          title: "Music genre Classification",
          period: "March 2020 - June 2020",
          subtitle: "Individual",
          summary: "An audio-genre prediction model was constructed using the FMA dataset.",
          contents: [
            "Combining CNN and RNN techniques in consideration of the characteristics as images through the melspectogram of audio, and the temporal properties of music."
          ],
          tech: "Tensorflow / PyTorch / Keras / Pandas",
          img: "/MGC_logo.png",
          imgAlt: "Music genre Classification Logo",
          width: "20%"
        }
      ];

      for (const projectData of projectsData) {
        await this.addProject(projectData);
      }
    }
  }
}

export const storage = new DatabaseStorage();
