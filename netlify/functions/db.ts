import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../../shared/schema";

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
    );
}

// SSL 설정 추가
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

export const db = drizzle({ client: pool, schema });

// Netlify Functions용 핸들러 예시
export const handler = async (event: any, context: any) => {
    try {
        const result = await db.query.users.findMany();
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
}; 