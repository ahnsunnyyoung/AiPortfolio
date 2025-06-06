import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePortfolioResponse } from "./openai";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint for AI responses
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = chatRequestSchema.parse(req.body);
      
      const aiResponse = await generatePortfolioResponse(message);
      
      // Store the conversation (optional - for analytics)
      // await storage.createChatMessage({ message, response: aiResponse });
      
      res.json({ 
        message: aiResponse,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: "Sorry, I'm having trouble responding right now. Please try again!" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Sunyoung's Portfolio API is running!" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
