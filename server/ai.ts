import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";
import { formatPeriod } from "../shared/period";

// Google Gemini via its official SDK.
// Set GEMINI_API_KEY (get one at https://aistudio.google.com/apikey).
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ko: "Korean",
  de: "German",
  nl: "Dutch",
  fr: "French",
};

const gemini = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export async function generatePersonalizedResponse(
  userQuestion: string,
  sessionId: string,
  language: string,
): Promise<string> {
  if (!gemini) {
    throw new Error("AI functionality is not available. Please provide a Gemini API key to enable personalized responses.");
  }

  try {
    // Get only active training data to build context
    const trainingData = await storage.getActiveTrainingData();
    const projects = await storage.getAllProjects();
    const experiences = await storage.getAllExperiences();
    const introduction = await storage.getIntroduction();
    const sessionConversations = await storage.getConversationsBySession(sessionId, 10);
    const knowledgeSummary = await storage.getKnowledgeSummary();

    // Build context from training data
    const knowledgeBase = trainingData
      .map(data => data.content)
      .join('\n\n');

    // Build conversation history context from current session only
    const conversationHistory = sessionConversations
      .map(conv => `Q: ${conv.question}\nA: ${conv.answer}`)
      .join('\n\n');

    // Build projects context
    const projectsContext = projects
      .map(project => `Project: ${project.title}
Period: ${formatPeriod(project)}
Subtitle: ${project.subtitle}
Summary: ${project.summary}
Contents: ${project.contents.join(', ')}
Technology: ${project.tech}
More Info: ${project.moreLink || 'N/A'}`)
      .join('\n\n');

    // Build experiences context
    const experiencesContext = experiences
      .map(exp => `Experience: ${exp.position} at ${exp.company}
Period: ${formatPeriod(exp)}
Location: ${exp.location}
Description: ${exp.description || 'N/A'}
Responsibilities: ${exp.responsibilities?.join(', ') || 'N/A'}
Skills: ${exp.skills || 'N/A'}
Website: ${exp.website || 'N/A'}`)
      .join('\n\n');

    const responseLanguage = LANGUAGE_NAMES[language] || language;
    const knowledgeContext = knowledgeSummary?.content || `INTRODUCTION:
  ${introduction?.content || 'No introduction available'}

  KNOWLEDGE BASE:
  ${knowledgeBase}

  PROJECTS:
  ${projectsContext}

  EXPERIENCES:
  ${experiencesContext}`;

    const systemPrompt = `You are Sunyoung Ahn's personalized AI assistant. Answer only from the portfolio knowledge below.

  PORTFOLIO KNOWLEDGE SUMMARY:
  ${knowledgeContext}

RECENT CONVERSATION CONTEXT:
${conversationHistory}

Guidelines:
- Answer questions based on the knowledge base, projects, and experiences provided above
- When asked about who Sunyoung is, introduce yourself, or general questions about Sunyoung, use the INTRODUCTION section
- When asked about specific projects, provide detailed information including period, technology used, contents, and key features
- When asked about experiences, include responsibilities, skills used, and achievements
- Speak in first person as if you are Sunyoung
- Respond in ${responseLanguage}
- Preserve names, company names, technology names, dates, and URLs exactly
- Be warm, professional, and helpful
- If you don't have specific information to answer a question, be honest about it
- For project-specific questions, provide comprehensive details from the projects data
- Use the conversation history for context but don't repeat previous answers unless relevant

Remember: You are representing Sunyoung based on the specific training data provided. Stay true to that information.`;

    const response = await gemini.models.generateContent({
      model: MODEL,
      contents: userQuestion,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    return response.text || "I'd be happy to help! Could you ask me something specific?";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("I'm having trouble connecting to my AI system right now. Please try again in a moment!");
  }
}

export async function generateKnowledgeSummary(): Promise<string> {
  if (!gemini) {
    throw new Error("AI functionality is not available. Please provide a Gemini API key to generate a summary.");
  }

  const [trainingData, projects, experiences, introduction, categories, skills] = await Promise.all([
    storage.getActiveTrainingData(),
    storage.getAllProjects(),
    storage.getAllExperiences(),
    storage.getIntroduction(),
    storage.getAllSkillCategories(),
    storage.getAllSkills(),
  ]);

  const skillsByCategory = categories.map(category => {
    const categorySkills = skills
      .filter(skill => skill.categoryId === category.id)
      .map(skill => skill.name)
      .join(", ");
    return `${category.name}: ${categorySkills}`;
  }).join("\n");

  const source = `INTRODUCTION:
${introduction?.content || "N/A"}

KNOWLEDGE BASE:
${trainingData.map(data => data.content).join("\n\n") || "N/A"}

PROJECTS:
${projects.map(project => `${project.title} | ${formatPeriod(project)} | ${project.subtitle} | ${project.summary} | ${project.contents.join(", ")} | ${project.tech} | ${project.detailedContent || ""}`).join("\n\n") || "N/A"}

EXPERIENCES:
${experiences.map(experience => `${experience.position} at ${experience.company} | ${formatPeriod(experience)} | ${experience.location} | ${experience.description || ""} | ${experience.responsibilities?.join(", ") || ""} | ${experience.skills || ""} | ${experience.detailedContent || ""}`).join("\n\n") || "N/A"}

SKILLS:
${skillsByCategory || "N/A"}`;

  const response = await gemini.models.generateContent({
    model: MODEL,
    contents: source,
    config: {
      systemInstruction: `Create one compact, factual knowledge summary for a portfolio AI assistant.
Organize it under Introduction, Knowledge, Projects, Experience, and Skills headings.
Keep exact facts such as names, dates, companies, technologies, responsibilities, and URLs.
Remove repetition and marketing language. Do not invent or omit important facts.
This summary will be used as the primary context for future answers.`,
      maxOutputTokens: 4000,
      temperature: 0.2,
    },
  });

  const summary = response.text?.trim();
  if (!summary) {
    throw new Error("Gemini returned an empty knowledge summary.");
  }
  return summary;
}