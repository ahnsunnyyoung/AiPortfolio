import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';

const RATE_LIMIT = 10; // 요청 수 제한
const WINDOW_MS = 60 * 1000; // 1분

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const aiRateLimiter = async (event: HandlerEvent): Promise<HandlerResponse | null> => {
    const ip = event.headers['client-ip'] || 'unknown';
    const now = Date.now();
    const userRequests = requestCounts.get(ip);

    if (!userRequests || now > userRequests.resetTime) {
        requestCounts.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return null;
    }

    if (userRequests.count >= RATE_LIMIT) {
        return {
            statusCode: 429,
            body: JSON.stringify({
                error: 'Too many requests. Please try again later.',
            }),
        };
    }

    userRequests.count++;
    return null;
}; 