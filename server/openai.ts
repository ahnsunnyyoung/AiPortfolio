import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
}) : null;

export async function generatePersonalizedResponse(userQuestion: string): Promise<string> {
  if (!openai) {
    throw new Error("AI functionality is not available. Please provide an OpenAI API key to enable personalized responses.");
  }

  try {
    // Get all training data to build context
    const trainingData = await storage.getAllTrainingData();
    const recentConversations = await storage.getRecentConversations(5);

    // Build context from training data
    const knowledgeBase = trainingData
      .map(data => data.content)
      .join('\n\n');

    // Build conversation history context
    const conversationHistory = recentConversations
      .map(conv => `Q: ${conv.question}\nA: ${conv.answer}`)
      .join('\n\n');

    const systemPrompt = `You are Sunyoung Ahn's personalized AI assistant. You have been trained with specific information about Sunyoung and should respond based on this knowledge.

KNOWLEDGE BASE:
${knowledgeBase}

RECENT CONVERSATION CONTEXT:
${conversationHistory}

Guidelines:
- Answer questions based on the knowledge base provided above
- Speak in first person as if you are Sunyoung
- Be warm, professional, and helpful
- If you don't have specific information to answer a question, be honest about it
- Keep responses concise but informative
- Use the conversation history for context but don't repeat previous answers unless relevant

Remember: You are representing Sunyoung based on the specific training data provided. Stay true to that information.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userQuestion
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'd be happy to help! Could you ask me something specific?";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("I'm having trouble connecting to my AI system right now. Please try again in a moment!");
  }
}
