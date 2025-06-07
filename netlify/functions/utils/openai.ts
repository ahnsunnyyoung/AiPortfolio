import OpenAI from 'openai';
import { db } from './db';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export async function generatePersonalizedResponse(
    question: string,
    sessionHistory: Message[] = []
): Promise<string> {
    const promptExamples = await db.query.trainingData.findMany();

    const systemPrompt = `You are a helpful AI assistant. Here are some example questions and responses:
${promptExamples.map(ex => `Q: ${ex.question}\nA: ${ex.responseType}`).join('\n\n')}`;

    const messages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...sessionHistory,
        { role: 'user', content: question },
    ];

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500,
    });

    return completion.choices[0].message.content || 'I apologize, but I could not generate a response at this time.';
} 