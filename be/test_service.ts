
import { KuesionerService } from './server/services/KuesionerService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testService() {
    try {
        console.log("Testing KuesionerService...");

        // Simulate Admin request with default params
        const params = {
            userId: 'test-admin-id',
            userRole: 'admin',
            tahunAjaran: '2024/2025 Ganjil',
            semester: 'all',
            prodiId: 'all',
            fakultasId: 'all'
        };

        console.log("Params:", params);

        const result = await KuesionerService.getKuesionerStats(params);

        console.log(`Result count: ${result.length}`);
        if (result.length > 0) {
            console.log("Sample:", result[0]);
        } else {
            console.log("No data found via Service.");
        }

        // Test with encoding issue simulation
        const paramsEncoded = {
            ...params,
            tahunAjaran: '2024/2025+Ganjil' // simulate literal +
        };
        console.log("Testing with literal +:", paramsEncoded.tahunAjaran);
        const result2 = await KuesionerService.getKuesionerStats(paramsEncoded);
        console.log(`Result count (encoded): ${result2.length}`);

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testService();
