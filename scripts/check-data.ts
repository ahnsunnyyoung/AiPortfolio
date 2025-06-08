import { db } from '../server/db';
import { trainingData } from '../shared/schema';

async function checkData() {
    try {
        const data = await db.select().from(trainingData);
        console.log('Current training data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        process.exit(0);
    }
}

checkData(); 