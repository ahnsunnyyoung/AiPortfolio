import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { db } from '../../utils/db';
import { eq } from 'drizzle-orm';

const messageSchema = z.object({
    content: z.string().min(1).max(1000),
    role: z.enum(['user', 'assistant']),
});

export const handler: Handler = async (event) => {
    const chatId = event.path.split('/')[2];
    if (!chatId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Chat ID is required' }),
        };
    }

    if (event.httpMethod === 'GET') {
        try {
            const messages = await db.query.messages.findMany({
                where: (messages, { eq }) => eq(messages.chatId, parseInt(chatId)),
                orderBy: (messages, { asc }) => [asc(messages.timestamp)],
            });

            return {
                statusCode: 200,
                body: JSON.stringify(messages),
            };
        } catch (error) {
            console.error('Get messages error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to get messages' }),
            };
        }
    }

    if (event.httpMethod === 'POST') {
        try {
            const { content, role } = messageSchema.parse(JSON.parse(event.body || '{}'));
            const message = await db.insert(db.messages).values({
                chatId: parseInt(chatId),
                content,
                role,
                timestamp: new Date(),
            }).returning();

            return {
                statusCode: 200,
                body: JSON.stringify(message[0]),
            };
        } catch (error) {
            console.error('Create message error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to create message' }),
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
    };
}; 