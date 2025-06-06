import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePersonalizedResponse } from "./openai";
import { z } from "zod";
import { insertTrainingDataSchema, insertConversationSchema, insertPromptExampleSchema } from "../shared/schema";

const askRequestSchema = z.object({
  question: z.string().min(1).max(1000),
  promptExampleId: z.number().optional(),
});

const trainRequestSchema = insertTrainingDataSchema;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize data on startup
  await storage.initializeProjects();
  await storage.initializeExperiences();
  await storage.initializePromptExamples();
  
  // Train endpoint - for adding knowledge to the AI
  app.post("/api/train", async (req, res) => {
    try {
      const trainingData = trainRequestSchema.parse(req.body);
      
      const result = await storage.addTrainingData(trainingData);
      
      res.json({ 
        success: true,
        message: "Training data added successfully",
        id: result.id,
        timestamp: result.timestamp
      });
    } catch (error) {
      console.error("Training error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Invalid training data format",
          details: error.errors
        });
      } else {
        res.status(500).json({ 
          error: "Failed to add training data" 
        });
      }
    }
  });

  // Ask endpoint - for asking questions to the trained AI
  app.post("/api/ask", async (req, res) => {
    try {
      const { question, promptExampleId } = askRequestSchema.parse(req.body);
      
      // If a prompt example ID is provided, check its response type
      if (promptExampleId) {
        const examples = await storage.getAllPromptExamples();
        const promptExample = examples.find(ex => ex.id === promptExampleId);
        
        if (promptExample) {
          if (promptExample.responseType === "experiences") {
            const experiences = await storage.getAllExperiences();
            
            // Store the conversation
            await storage.addConversation({
              question,
              answer: "EXPERIENCE_SHOWCASE" // Special marker for experience responses
            });
            
            res.json({ 
              answer: "Here are my work experiences:",
              experiences: experiences,
              isExperienceResponse: true
            });
            return;
          }
          
          if (promptExample.responseType === "projects") {
            const projects = await storage.getAllProjects();
            
            // Store the conversation
            await storage.addConversation({
              question,
              answer: "PROJECT_SHOWCASE" // Special marker for project responses
            });
            
            res.json({ 
              answer: "Here are my projects:",
              projects: projects,
              isProjectResponse: true
            });
            return;
          }
        }
      }
      
      const aiResponse = await generatePersonalizedResponse(question);
      
      // Store the conversation for context in future responses
      await storage.addConversation({ 
        question, 
        answer: aiResponse 
      });
      
      res.json({ 
        answer: aiResponse,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Ask error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Invalid question format",
          details: error.errors
        });
      } else {
        res.status(500).json({ 
          error: (error as Error).message || "Sorry, I'm having trouble responding right now. Please try again!" 
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
        message: "Training data deleted successfully"
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
        project: result
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
        project: result
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
        message: "Project deleted successfully"
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
        experiences
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
        experience: result
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
        experience: result
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
        message: "Experience deleted successfully"
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
  app.get("/api/prompt-examples/active", async (_req, res) => {
    try {
      const examples = await storage.getActivePromptExamples();
      res.json({ success: true, examples });
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
        example: result
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
        example: result
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
        message: "Prompt example deleted successfully"
      });
    } catch (error) {
      console.error("Delete prompt example error:", error);
      res.status(500).json({ error: "Failed to delete prompt example" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Sunyoung's AI Agent API is running!" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
