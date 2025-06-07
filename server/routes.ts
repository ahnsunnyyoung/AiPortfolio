import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePersonalizedResponse } from "./openai";
import { translateText, translateSkillsAndContent } from "./translate";
import { z } from "zod";
import {
  insertTrainingDataSchema,
  insertConversationSchema,
  insertPromptExampleSchema,
} from "../shared/schema";

const askRequestSchema = z.object({
  question: z.string().min(1).max(1000),
  promptExampleId: z.number().optional(),
  language: z.string().default('en'),
});

const trainRequestSchema = insertTrainingDataSchema;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize data on startup
  await storage.initializeProjects();
  await storage.initializeExperiences();
  await storage.initializePromptExamples();
  await storage.initializeContact();
  await storage.initializeSkills();
  await storage.initializeIntroduction();

  // Train endpoint - for adding knowledge to the AI
  app.post("/api/train", async (req, res) => {
    try {
      const trainingData = trainRequestSchema.parse(req.body);

      const result = await storage.addTrainingData(trainingData);

      res.json({
        success: true,
        message: "Training data added successfully",
        id: result.id,
        timestamp: result.timestamp,
      });
    } catch (error) {
      console.error("Training error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Invalid training data format",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          error: "Failed to add training data",
        });
      }
    }
  });

  // Ask endpoint - for asking questions to the trained AI
  app.post("/api/ask", async (req, res) => {
    try {
      const { question, promptExampleId, language } = askRequestSchema.parse(req.body);

      // If a prompt example ID is provided, check its response type
      if (promptExampleId) {
        const examples = await storage.getAllPromptExamples();
        const promptExample = examples.find((ex) => ex.id === promptExampleId);

        if (promptExample) {
          if (promptExample.responseType === "experiences") {
            const experiences = await storage.getAllExperiences();

            // Store the conversation
            await storage.addConversation({
              question,
              answer: "EXPERIENCE_SHOWCASE", // Special marker for experience responses
            });

            // Translate the response message
            const experienceMessage = "Here are my work experiences:";
            const translatedMessage = await translateText({ 
              text: experienceMessage, 
              targetLanguage: language, 
              context: "work experience introduction" 
            });

            res.json({
              answer: translatedMessage,
              experiences: experiences,
              isExperienceResponse: true,
            });
            return;
          }

          if (promptExample.responseType === "projects") {
            const projects = await storage.getAllProjects();

            // Store the conversation
            await storage.addConversation({
              question,
              answer: "PROJECT_SHOWCASE", // Special marker for project responses
            });

            // Translate the response message
            const projectMessage = "Here are my projects:";
            const translatedMessage = await translateText({ 
              text: projectMessage, 
              targetLanguage: language, 
              context: "projects introduction" 
            });

            res.json({
              answer: translatedMessage,
              projects: projects,
              isProjectResponse: true,
            });
            return;
          }

          if (promptExample.responseType === "contacts") {
            const contact = await storage.getContact();
            
            // Store the conversation
            await storage.addConversation({
              question,
              answer: "CONTACT_SHOWCASE", // Special marker for contact responses
            });

            // Translate the response message
            const contactMessage = "Here's how you can contact me:";
            const translatedMessage = await translateText({ 
              text: contactMessage, 
              targetLanguage: language, 
              context: "contact information introduction" 
            });

            res.json({
              answer: translatedMessage,
              contacts: contact || {
                email: "ahnsunnyyoung@gmail.com",
                linkedin: "https://www.linkedin.com/in/ahnsunnyyoung/",
                github: "https://github.com/ahnsunnyyoung",
              },
              isContactResponse: true,
            });
            return;
          }
          
          if (promptExample.responseType === "skills") {
            const skillCategories = await storage.getAllSkillCategories();
            const allSkills = await storage.getAllSkills();
            
            // Organize skills by category
            const organizedSkills: Record<string, string[]> = {};
            for (const category of skillCategories) {
              const categorySkills = allSkills
                .filter(skill => skill.categoryId === category.id)
                .map(skill => skill.name);
              organizedSkills[category.name.toLowerCase()] = categorySkills;
            }
            
            // Store the conversation
            await storage.addConversation({
              question,
              answer: "SKILLS_SHOWCASE" // Special marker for skills responses
            });
            
            // Translate the response message and skills
            const skillsMessage = "Here are my technical skills and expertise:";
            const translatedMessage = await translateText({ 
              text: skillsMessage, 
              targetLanguage: language, 
              context: "technical skills introduction" 
            });

            // Translate skills content
            const translatedSkillsData = await translateSkillsAndContent({ skills: organizedSkills }, language);

            res.json({ 
              answer: translatedMessage,
              skills: translatedSkillsData.skills,
              skillCategories: skillCategories,
              isSkillsResponse: true
            });
            return;
          }

          if (promptExample.responseType === "introduce") {
            const introduction = await storage.getIntroduction();
            
            // Store the conversation
            await storage.addConversation({
              question,
              answer: introduction?.content || "INTRODUCTION_SHOWCASE",
            });

            // Translate the introduction content
            const introContent = introduction?.content || "Hello! I'm Sunyoung Ahn, also known as Sunny. I'm a frontend developer with five years of experience.";
            const translatedIntro = await translateText({ 
              text: introContent, 
              targetLanguage: language, 
              context: "personal introduction" 
            });

            res.json({
              answer: translatedIntro,
              isIntroductionResponse: true,
            });
            return;
          }
        }
      }

      const aiResponse = await generatePersonalizedResponse(question);

      // Translate AI response if not in English
      const translatedResponse = await translateText({ 
        text: aiResponse, 
        targetLanguage: language, 
        context: "AI assistant response about personal portfolio and professional experience" 
      });

      // Store the conversation for context in future responses
      await storage.addConversation({
        question,
        answer: translatedResponse,
      });

      res.json({
        answer: translatedResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Ask error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Invalid question format",
          details: error.errors,
        });
      } else {
        res.status(500).json({
          error:
            (error as Error).message ||
            "Sorry, I'm having trouble responding right now. Please try again!",
        });
      }
    }
  });

  // Get training data endpoint (for debugging/admin)
  app.get("/api/training-data", async (_req, res) => {
    try {
      const data = await storage.getAllTrainingData();
      res.json({ data });
    } catch (error) {
      console.error("Get training data error:", error);
      res.status(500).json({ error: "Failed to retrieve training data" });
    }
  });

  // Update training data endpoint
  app.put("/api/training-data/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid training data ID" });
      }

      const validatedData = trainRequestSchema.parse(req.body);
      const data = await storage.updateTrainingData(id, validatedData);
      
      res.json({
        success: true,
        data,
        message: "Training data updated successfully",
      });
    } catch (error) {
      console.error("Update training data error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Invalid training data format",
          details: error.errors,
        });
      } else {
        res.status(500).json({ error: "Failed to update training data" });
      }
    }
  });

  // Delete training data endpoint
  app.delete("/api/training-data/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid training data ID" });
      }

      await storage.deleteTrainingData(id);
      res.json({
        success: true,
        message: "Training data deleted successfully",
      });
    } catch (error) {
      console.error("Delete training data error:", error);
      res.status(500).json({ error: "Failed to delete training data" });
    }
  });

  // Get conversation history endpoint
  app.get("/api/conversations", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const conversations = await storage.getRecentConversations(limit);
      res.json({ conversations });
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Failed to retrieve conversations" });
    }
  });

  // Get projects endpoint
  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json({ projects });
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ error: "Failed to retrieve projects" });
    }
  });

  // Add project endpoint
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = req.body;
      const result = await storage.addProject(projectData);
      res.json({
        success: true,
        message: "Project added successfully",
        project: result,
      });
    } catch (error) {
      console.error("Add project error:", error);
      res.status(500).json({ error: "Failed to add project" });
    }
  });

  // Update project endpoint
  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const projectData = req.body;
      const result = await storage.updateProject(id, projectData);
      res.json({
        success: true,
        message: "Project updated successfully",
        project: result,
      });
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project endpoint
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      await storage.deleteProject(id);
      res.json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Get all experiences endpoint
  app.get("/api/experiences", async (_req, res) => {
    try {
      const experiences = await storage.getAllExperiences();
      res.json({
        success: true,
        experiences,
      });
    } catch (error) {
      console.error("Get experiences error:", error);
      res.status(500).json({ error: "Failed to get experiences" });
    }
  });

  // Add experience endpoint
  app.post("/api/experiences", async (req, res) => {
    try {
      const experienceData = req.body;
      const result = await storage.addExperience(experienceData);
      res.json({
        success: true,
        message: "Experience added successfully",
        experience: result,
      });
    } catch (error) {
      console.error("Add experience error:", error);
      res.status(500).json({ error: "Failed to add experience" });
    }
  });

  // Update experience endpoint
  app.put("/api/experiences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid experience ID" });
      }

      const experienceData = req.body;
      const result = await storage.updateExperience(id, experienceData);
      res.json({
        success: true,
        message: "Experience updated successfully",
        experience: result,
      });
    } catch (error) {
      console.error("Update experience error:", error);
      res.status(500).json({ error: "Failed to update experience" });
    }
  });

  // Delete experience endpoint
  app.delete("/api/experiences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid experience ID" });
      }

      await storage.deleteExperience(id);
      res.json({
        success: true,
        message: "Experience deleted successfully",
      });
    } catch (error) {
      console.error("Delete experience error:", error);
      res.status(500).json({ error: "Failed to delete experience" });
    }
  });

  // Get all prompt examples endpoint
  app.get("/api/prompt-examples", async (_req, res) => {
    try {
      const examples = await storage.getAllPromptExamples();
      res.json({ success: true, examples });
    } catch (error) {
      console.error("Get prompt examples error:", error);
      res.status(500).json({ error: "Failed to get prompt examples" });
    }
  });

  // Get active prompt examples endpoint
  app.get("/api/prompt-examples/active", async (req, res) => {
    try {
      const language = req.query.language as string || 'en';
      const examples = await storage.getActivePromptExamples();
      
      // Translate prompt questions if not in English
      if (language !== 'en') {
        const translatedExamples = await Promise.all(
          examples.map(async (example) => {
            const translatedQuestion = await translateText({
              text: example.question,
              targetLanguage: language,
              context: "prompt example question"
            });
            return {
              ...example,
              question: translatedQuestion
            };
          })
        );
        res.json({ success: true, examples: translatedExamples });
      } else {
        res.json({ success: true, examples });
      }
    } catch (error) {
      console.error("Get active prompt examples error:", error);
      res.status(500).json({ error: "Failed to get active prompt examples" });
    }
  });

  // Add prompt example endpoint
  app.post("/api/prompt-examples", async (req, res) => {
    try {
      const exampleData = insertPromptExampleSchema.parse(req.body);
      const result = await storage.addPromptExample(exampleData);
      res.json({
        success: true,
        message: "Prompt example added successfully",
        example: result,
      });
    } catch (error) {
      console.error("Add prompt example error:", error);
      res.status(500).json({ error: "Failed to add prompt example" });
    }
  });

  // Update prompt example endpoint
  app.put("/api/prompt-examples/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid prompt example ID" });
      }

      const exampleData = insertPromptExampleSchema.parse(req.body);
      const result = await storage.updatePromptExample(id, exampleData);
      res.json({
        success: true,
        message: "Prompt example updated successfully",
        example: result,
      });
    } catch (error) {
      console.error("Update prompt example error:", error);
      res.status(500).json({ error: "Failed to update prompt example" });
    }
  });

  // Delete prompt example endpoint
  app.delete("/api/prompt-examples/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid prompt example ID" });
      }

      await storage.deletePromptExample(id);
      res.json({
        success: true,
        message: "Prompt example deleted successfully",
      });
    } catch (error) {
      console.error("Delete prompt example error:", error);
      res.status(500).json({ error: "Failed to delete prompt example" });
    }
  });

  // Contact management endpoints
  app.get("/api/contact", async (req, res) => {
    try {
      const contact = await storage.getContact();
      res.json({ success: true, contact });
    } catch (error) {
      console.error("Get contact error:", error);
      res.status(500).json({ success: false, error: "Failed to get contact" });
    }
  });

  app.put("/api/contact", async (req, res) => {
    try {
      const contactData = req.body;
      const contact = await storage.updateContact(contactData);
      res.json({ success: true, contact, message: "Contact updated successfully" });
    } catch (error) {
      console.error("Update contact error:", error);
      res.status(500).json({ success: false, error: "Failed to update contact" });
    }
  });

  // Skills management endpoints
  app.get("/api/skill-categories", async (req, res) => {
    try {
      const categories = await storage.getAllSkillCategories();
      res.json({ success: true, categories });
    } catch (error) {
      console.error("Get skill categories error:", error);
      res.status(500).json({ success: false, error: "Failed to get skill categories" });
    }
  });

  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json({ success: true, skills });
    } catch (error) {
      console.error("Get skills error:", error);
      res.status(500).json({ success: false, error: "Failed to get skills" });
    }
  });

  app.post("/api/skills", async (req, res) => {
    try {
      const skillData = req.body;
      const skill = await storage.addSkill(skillData);
      res.json({ success: true, skill, message: "Skill added successfully" });
    } catch (error) {
      console.error("Add skill error:", error);
      res.status(500).json({ success: false, error: "Failed to add skill" });
    }
  });

  app.put("/api/skills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const skillData = req.body;
      const skill = await storage.updateSkill(id, skillData);
      res.json({ success: true, skill, message: "Skill updated successfully" });
    } catch (error) {
      console.error("Update skill error:", error);
      res.status(500).json({ success: false, error: "Failed to update skill" });
    }
  });

  app.delete("/api/skills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSkill(id);
      res.json({ success: true, message: "Skill deleted successfully" });
    } catch (error) {
      console.error("Delete skill error:", error);
      res.status(500).json({ success: false, error: "Failed to delete skill" });
    }
  });

  // Introduction endpoints
  app.get("/api/introduction", async (_req, res) => {
    try {
      const introduction = await storage.getIntroduction();
      res.json({ success: true, introduction });
    } catch (error) {
      console.error("Get introduction error:", error);
      res.status(500).json({ success: false, error: "Failed to get introduction" });
    }
  });

  app.put("/api/introduction", async (req, res) => {
    try {
      const { content, img, name, title, location, experience, technologies } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ success: false, error: "Content is required" });
      }
      
      const introduction = await storage.updateIntroduction({
        content,
        img,
        name,
        title,
        location,
        experience,
        technologies
      });
      res.json({ success: true, introduction, message: "Introduction updated successfully" });
    } catch (error) {
      console.error("Update introduction error:", error);
      res.status(500).json({ success: false, error: "Failed to update introduction" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Sunyoung's AI Agent API is running!" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
