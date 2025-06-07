import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { db } from './utils/db';

const chatSchema = z.object({
    title: z.string().min(1).max(100),
    sessionId: z.string().optional(),
});

export const handler: Handler = async (event) => {
    if (event.httpMethod === 'POST') {
        try {
            const { title, sessionId } = chatSchema.parse(JSON.parse(event.body || '{}'));
            const chat = await db.insert(db.chats).values({
                title,
                sessionId,
                timestamp: new Date(),
            }).returning();

            return {
                statusCode: 200,
                body: JSON.stringify(chat[0]),
            };
        } catch (error) {
            console.error('Create chat error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to create chat' }),
            };
        }
    }

    if (event.httpMethod === 'GET') {
        try {
            const chats = await db.query.chats.findMany({
                orderBy: (chats, { desc }) => [desc(chats.timestamp)],
            });

            return {
                statusCode: 200,
                body: JSON.stringify(chats),
            };
        } catch (error) {
            console.error('Get chats error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to get chats' }),
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
    };
}; 