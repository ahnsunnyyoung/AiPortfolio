import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePersonalizedResponse } from "./openai";
import { z } from "zod";
import { insertTrainingDataSchema, insertConversationSchema } from "../shared/schema";

const askRequestSchema = z.object({
  question: z.string().min(1).max(1000),
});

const trainRequestSchema = insertTrainingDataSchema;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize projects data on startup
  await storage.initializeProjects();
  
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
      const { question } = askRequestSchema.parse(req.body);
      
      // Check if the question is about projects
      const projectKeywords = ['project', 'projects', 'work', 'portfolio', 'built', 'developed', 'created', 'app', 'application', 'website'];
      const isProjectQuestion = projectKeywords.some(keyword => 
        question.toLowerCase().includes(keyword)
      );
      
      if (isProjectQuestion) {
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

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Sunyoung's AI Agent API is running!" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
