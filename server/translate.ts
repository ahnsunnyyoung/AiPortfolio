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

export async function translateSkillsAndContent(data: any, targetLanguage: string): Promise<any> {
  if (targetLanguage === 'en') {
    return data; // No translation needed for English
  }

  try {
    // Translate skills if present
    if (data.skills) {
      const translatedSkills: any = {};
      
      for (const [category, skills] of Object.entries(data.skills)) {
        if (Array.isArray(skills)) {
          const translatedSkillList = await Promise.all(
            skills.map(async (skill: string) => {
              // Don't translate proper nouns like "React", "JavaScript", etc.
              const techTerms = ['React', 'JavaScript', 'TypeScript', 'Node.js', 'HTML5', 'CSS3', 'Vue.js', 'Next.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Git', 'Docker', 'AWS', 'Vercel', 'Figma', 'VS Code'];
              if (techTerms.some(term => skill.includes(term))) {
                return skill;
              }
              return await translateText({ text: skill, targetLanguage, context: "professional skill" });
            })
          );
          translatedSkills[category] = translatedSkillList;
        }
      }
      data.skills = translatedSkills;
    }

    return data;
  } catch (error) {
    console.error("Content translation error:", error);
    return data;
  }
}