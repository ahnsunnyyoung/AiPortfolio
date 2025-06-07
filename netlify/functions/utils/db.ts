import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../../../shared/schema';
import { Pool } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
    );
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

export const db = drizzle(pool, { schema });

// Utility functions
export async function getRecentConversations(limit: number) {
    return await db.query.conversations.findMany({
        limit,
        orderBy: (conversations, { desc }) => [desc(conversations.timestamp)],
    });
}

export async function getAllPromptExamples() {
    return await db.query.trainingData.findMany();
}

export async function getAllExperiences() {
    return await db.query.experiences.findMany();
}

export async function addConversation(data: { question: string; answer: string }) {
    return await db.insert(schema.conversations).values({
        question: data.question,
        answer: data.answer,
        timestamp: new Date(),
    });
} 