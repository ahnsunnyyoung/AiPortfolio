import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

// WebSocket 설정을 Netlify 환경에 맞게 수정
if (typeof window === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

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