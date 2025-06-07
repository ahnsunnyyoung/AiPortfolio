import { trainingData, conversations, projects, experiences, promptExamples, contacts, skillCategories, skills, introduction, translations, type TrainingData, type InsertTrainingData, type Conversation, type InsertConversation, type Project, type InsertProject, type Experience, type InsertExperience, type PromptExample, type InsertPromptExample, type Contact, type InsertContact, type SkillCategory, type InsertSkillCategory, type Skill, type InsertSkill, type Introduction, type InsertIntroduction, type Translation, type InsertTranslation } from "../shared/schema";
import { db } from "./db";
import { desc, eq, asc, and } from "drizzle-orm";

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
  // Contacts management
  getContact(): Promise<Contact | undefined>;
  updateContact(contact: InsertContact): Promise<Contact>;
  initializeContact(): Promise<void>;
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
  initializeSkills(): Promise<void>;
  // Introduction management
  getIntroduction(): Promise<Introduction | undefined>;
  updateIntroduction(data: InsertIntroduction): Promise<Introduction>;
  initializeIntroduction(): Promise<void>;
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

  async initializeContact(): Promise<void> {
    const existingContact = await this.getContact();
    if (!existingContact) {
      await this.updateContact({
        email: "ahnsunnyyoung@gmail.com",
        linkedin: "https://www.linkedin.com/in/ahnsunnyyoung/",
        github: "https://github.com/ahnsunnyyoung",
        website: "",
        phone: ""
      });
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

  async initializeSkills(): Promise<void> {
    const existingCategories = await this.getAllSkillCategories();
    if (existingCategories.length === 0) {
      // Create default skill categories
      const defaultCategories = [
        { name: "Programming", icon: "Code", color: "orange", displayOrder: 1 },
        { name: "Frontend", icon: "Monitor", color: "blue", displayOrder: 2 },
        { name: "Backend", icon: "Server", color: "green", displayOrder: 3 },
        { name: "Tools", icon: "Wrench", color: "purple", displayOrder: 4 },
        { name: "Languages", icon: "Globe", color: "indigo", displayOrder: 5 },
        { name: "Soft Skills", icon: "Users", color: "pink", displayOrder: 6 }
      ];

      const createdCategories = [];
      for (const category of defaultCategories) {
        const created = await this.addSkillCategory(category);
        createdCategories.push(created);
      }

      // Create default skills for each category
      const defaultSkillsData = [
        { categoryName: "Programming", skills: ["JavaScript", "TypeScript", "Python", "Java", "C++"] },
        { categoryName: "Frontend", skills: ["React", "Next.js", "Vue.js", "HTML5", "CSS3", "Tailwind CSS"] },
        { categoryName: "Backend", skills: ["Node.js", "Express.js", "FastAPI", "Spring Boot", "PostgreSQL", "MongoDB"] },
        { categoryName: "Tools", skills: ["Git", "Docker", "AWS", "Vercel", "Figma", "VS Code"] },
        { categoryName: "Languages", skills: ["Korean (Native)", "English (Fluent)", "Japanese (Conversational)"] },
        { categoryName: "Soft Skills", skills: ["Problem Solving", "Team Leadership", "Project Management", "UI/UX Design"] }
      ];

      for (const skillGroup of defaultSkillsData) {
        const category = createdCategories.find(c => c.name === skillGroup.categoryName);
        if (category) {
          for (let i = 0; i < skillGroup.skills.length; i++) {
            await this.addSkill({
              name: skillGroup.skills[i],
              categoryId: category.id,
              proficiency: "advanced",
              displayOrder: i + 1
            });
          }
        }
      }
    }
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

  async initializeIntroduction(): Promise<void> {
    const existing = await this.getIntroduction();
    if (!existing) {
      const defaultIntroduction = `Hello! I'm Sunyoung Ahn, also known as Sunny. I'm a frontend developer with five years of experience in creating intuitive and performant user experiences across different platforms. I specialize in frontend development, focusing on usability and design. My core technical skills include React, Flutter, Firebase, and Google Cloud, and I'm comfortable with tools like Figma, Canva, Jira, and Confluence.

I have a passion for transforming complex challenges into elegant and simple interfaces — it's the part of my work that feels most like art. Currently, I'm based in Dublin, Ireland, working as a frontend developer at GoldCore, where I develop a cross-platform gold trading app.

Outside of work, I enjoy weight training, knitting, and baking, which reflect my attention to detail, discipline, and creativity. I'm also fluent in English and Korean and currently learning German. If you'd like to know more, feel free to ask!`;
      
      await this.updateIntroduction({
        content: defaultIntroduction,
        name: "Sunyoung Ahn (Sunny)",
        title: "Frontend Developer",
        location: "Dublin, Ireland",
        experience: "5+ years",
        technologies: "React, Flutter, Firebase, Google Cloud"
      });
    }
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
}

export const storage = new DatabaseStorage();