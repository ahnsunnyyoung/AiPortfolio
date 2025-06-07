import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { db } from '../../../utils/db';
import { eq, and } from 'drizzle-orm';

const messageUpdateSchema = z.object({
    content: z.string().min(1).max(1000),
});

export const handler: Handler = async (event) => {
    const [chatId, messageId] = event.path.split('/').slice(2, 4);
    if (!chatId || !messageId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Chat ID and Message ID are required' }),
        };
    }

    if (event.httpMethod === 'GET') {
        try {
            const message = await db.query.messages.findFirst({
                where: (messages, { and, eq }) => and(
                    eq(messages.chatId, parseInt(chatId)),
                    eq(messages.id, parseInt(messageId))
                ),
            });

            if (!message) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Message not found' }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(message),
            };
        } catch (error) {
            console.error('Get message error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to get message' }),
            };
        }
    }

    if (event.httpMethod === 'PUT') {
        try {
            const { content } = messageUpdateSchema.parse(JSON.parse(event.body || '{}'));
            const message = await db.update(db.messages)
                .set({ content })
                .where(and(
                    eq(db.messages.chatId, parseInt(chatId)),
                    eq(db.messages.id, parseInt(messageId))
                ))
                .returning();

            if (!message.length) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Message not found' }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(message[0]),
            };
        } catch (error) {
            console.error('Update message error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to update message' }),
            };
        }
    }

    if (event.httpMethod === 'DELETE') {
        try {
            await db.delete(db.messages)
                .where(and(
                    eq(db.messages.chatId, parseInt(chatId)),
                    eq(db.messages.id, parseInt(messageId))
                ));

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Message deleted successfully' }),
            };
        } catch (error) {
            console.error('Delete message error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to delete message' }),
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
    };
}; 