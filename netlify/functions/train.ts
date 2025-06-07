import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { db } from './utils/db';
import { trainingData } from '../../shared/schema';

const trainSchema = z.object({
    question: z.string().min(1).max(1000),
    responseType: z.string().min(1).max(100),
    content: z.string().min(1).max(1000),
});

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { question, responseType, content } = trainSchema.parse(body);

        const result = await db.insert(trainingData).values({
            question,
            responseType,
            content,
            timestamp: new Date(),
        });

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
}; 