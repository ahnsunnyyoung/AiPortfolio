import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { db } from './utils/db';
import { generatePersonalizedResponse } from './utils/openai';
import { translateText } from './utils/translate';
import { aiRateLimiter } from './utils/rateLimiter';
import { conversations, trainingData } from '../../shared/schema';

const askSchema = z.object({
    question: z.string().min(1).max(1000),
    promptExampleId: z.number().optional(),
    targetLanguage: z.string().optional(),
});

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const rateLimitResult = await aiRateLimiter(event);
        if (rateLimitResult) {
            return rateLimitResult;
        }

        const body = JSON.parse(event.body || '{}');
        const { question, promptExampleId, targetLanguage } = askSchema.parse(body);

        const recentConversations = await db.query.conversations.findMany({
            limit: 1,
            orderBy: (conversations, { desc }) => [desc(conversations.timestamp)],
        });

        if (recentConversations.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    answer: '안녕하세요! 무엇을 도와드릴까요?',
                }),
            };
        }

        let answer: string;

        if (promptExampleId) {
            const examples = await db.query.trainingData.findMany();
            const promptExample = examples.find((ex) => ex.id === promptExampleId);

            if (promptExample) {
                if (promptExample.responseType === 'experiences') {
                    const experiences = await db.query.experiences.findMany();
                    await db.insert(conversations).values({
                        question,
                        answer: 'EXPERIENCE_SHOWCASE',
                        timestamp: new Date(),
                    });

                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            answer: 'EXPERIENCE_SHOWCASE',
                            experiences,
                        }),
                    };
                }
            }
        }

        const sessionHistory = recentConversations.map((conv) => ({
            role: 'assistant',
            content: conv.answer,
        }));

        answer = await generatePersonalizedResponse(question, sessionHistory);

        await db.insert(conversations).values({
            question,
            answer,
            timestamp: new Date(),
        });

        if (targetLanguage && targetLanguage !== 'en') {
            answer = await translateText(answer, targetLanguage);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ answer }),
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
}; 