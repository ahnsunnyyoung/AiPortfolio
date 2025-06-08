import { db } from '../server/db';
import { trainingData } from '../shared/schema';
import * as fs from 'fs';
import * as path from 'path';

async function seedData() {
    try {
        // Read the JSON file
        const jsonPath = path.join(process.cwd(), 'training_data.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        // Insert data into the database
        for (const item of jsonData) {
            await db.insert(trainingData).values({
                question: "Tell me about yourself",
                responseType: "personal_info",
                content: item.content,
                isActive: item.is_active,
                timestamp: new Date(item.timestamp)
            });
        }

        console.log('Data seeded successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        process.exit(0);
    }
}

seedData(); 