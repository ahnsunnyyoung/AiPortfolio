import { Handler } from '@netlify/functions';
import { db } from '../utils/db';
import { eq } from 'drizzle-orm';

export const handler: Handler = async (event) => {
    const id = event.path.split('/').pop();
    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Chat ID is required' }),
        };
    }

    if (event.httpMethod === 'GET') {
        try {
            const chat = await db.query.chats.findFirst({
                where: (chats, { eq }) => eq(chats.id, parseInt(id)),
            });

            if (!chat) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'Chat not found' }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(chat),
            };
        } catch (error) {
            console.error('Get chat error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to get chat' }),
            };
        }
    }

    if (event.httpMethod === 'DELETE') {
        try {
            await db.delete(db.chats).where(eq(db.chats.id, parseInt(id)));
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Chat deleted successfully' }),
            };
        } catch (error) {
            console.error('Delete chat error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to delete chat' }),
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
    };
}; 