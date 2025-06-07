import OpenAI from "openai";
import { storage } from "./storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

interface TranslationRequest {
  text: string;
  targetLanguage: string;
  context?: string;
}

export async function translateText({ text, targetLanguage, context }: TranslationRequest): Promise<string> {
  if (targetLanguage === 'en') {
    return text; // No translation needed for English
  }

  // Check cache first
  const cachedTranslation = await storage.getCachedTranslation(text, targetLanguage, context);
  if (cachedTranslation) {
    return cachedTranslation.translatedText;
  }

  const languageMap: Record<string, string> = {
    ko: "Korean",
    de: "German", 
    nl: "Dutch"
  };

  const targetLang = languageMap[targetLanguage] || targetLanguage;

  try {
    const systemPrompt = `You are a professional translator. Translate the given text to ${targetLang} while maintaining:
1. Natural, fluent language that sounds native
2. Professional tone appropriate for a portfolio/resume context
3. Technical terms should be appropriately localized
4. Personal names should remain unchanged
5. Keep the same structure and formatting

${context ? `Context: ${context}` : ''}

Respond only with the translated text, no explanations or additional content.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const translatedText = response.choices[0]?.message?.content?.trim() || text;
    
    // Cache the translation for future use
    try {
      await storage.addTranslation({
        originalText: text,
        translatedText,
        language: targetLanguage,
        context: context || null
      });
    } catch (cacheError) {
      console.error("Failed to cache translation:", cacheError);
      // Continue even if caching fails
    }
    
    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
  }
}

export async function translateProjectsAndExperiences(data: any, targetLanguage: string): Promise<any> {
  if (targetLanguage === 'en') {
    return data; // No translation needed for English
  }

  try {
    // Translate project content if present
    if (data.projects && Array.isArray(data.projects)) {
      data.projects = await Promise.all(
        data.projects.map(async (project: any) => {
          if (project.detailedContent) {
            const translatedContent = await translateText({
              text: project.detailedContent,
              targetLanguage,
              context: "project detailed content"
            });
            return { ...project, detailedContent: translatedContent };
          }
          return project;
        })
      );
    }

    // Translate experience content if present
    if (data.experiences && Array.isArray(data.experiences)) {
      data.experiences = await Promise.all(
        data.experiences.map(async (experience: any) => {
          if (experience.detailedContent) {
            const translatedContent = await translateText({
              text: experience.detailedContent,
              targetLanguage,
              context: "experience detailed content"
            });
            return { ...experience, detailedContent: translatedContent };
          }
          return experience;
        })
      );
    }

    return data;
  } catch (error) {
    console.error("Content translation error:", error);
    return data;
  }
}