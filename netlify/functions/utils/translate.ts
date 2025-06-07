import OpenAI from 'openai';
import { db } from './db';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY must be set');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface TranslateParams {
    text: string;
    targetLanguage: string;
    context?: string;
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
    if (targetLanguage === 'en') {
        return text;
    }

    const prompt = `Translate the following text to ${targetLanguage}:

${text}

Provide only the translated text without any additional explanations or notes.`;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a professional translator.' },
            { role: 'user', content: prompt }
        ],
        model: 'gpt-4-turbo-preview',
        temperature: 0.3,
        max_tokens: 1000,
    });

    return completion.choices[0].message.content || text;
}

interface TranslateDataParams {
    experiences?: Array<{
        title: string;
        company: string;
        description: string;
        startDate: string;
        endDate: string;
    }>;
    projects?: Array<{
        title: string;
        description: string;
        technologies: string[];
        startDate: string;
        endDate: string;
    }>;
}

export async function translateProjectsAndExperiences(targetLanguage: string) {
    const [projects, experiences] = await Promise.all([
        db.query.projects.findMany(),
        db.query.experiences.findMany(),
    ]);

    const translatedProjects = await Promise.all(
        projects.map(async (project) => ({
            ...project,
            title: await translateText(project.title, targetLanguage),
            description: await translateText(project.description, targetLanguage),
        }))
    );

    const translatedExperiences = await Promise.all(
        experiences.map(async (experience) => ({
            ...experience,
            title: await translateText(experience.title, targetLanguage),
            description: await translateText(experience.description || '', targetLanguage),
        }))
    );

    return {
        projects: translatedProjects,
        experiences: translatedExperiences,
    };
} 