
import { KuesionerService } from './server/services/KuesionerService';
import { prisma } from './server/lib/prisma';

async function testServiceDirectly() {
    console.log("DEBUG: Testing KuesionerService.getKuesionerStats directly...");

    const params = {
        userId: 'any-admin-id', // ID doesn't matter for admin logic usually, but required by type
        userRole: 'admin',
        tahunAjaran: '2024/2025 Ganjil',
        semester: 'all',
        prodiId: 'all',
        fakultasId: 'all'
    };

    console.log("Params:", JSON.stringify(params, null, 2));

    try {
        const stats = await KuesionerService.getKuesionerStats(params);
        console.log("Service Result Count:", stats.length);
        if (stats.length > 0) {
            console.log("First Item:", stats[0]);
        } else {
            console.log("WARNING: Service returned 0 items!");
        }
    } catch (error) {
        console.error("Service Error:", error);
    }
}

testServiceDirectly()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
