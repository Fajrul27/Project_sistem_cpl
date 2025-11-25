
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma Client...');
    try {
        // Check if models exist on the client instance
        const models = [
            'fakultas',
            'prodi',
            'levelTaksonomi',
            'kategoriCpl',
            'teknikPenilaianRef',
            'kurikulum',
            'jenisMataKuliah'
        ];

        for (const model of models) {
            if ((prisma as any)[model]) {
                console.log(`✅ Model '${model}' exists.`);
                // Try a simple count to ensure DB connection and schema match
                const count = await (prisma as any)[model].count();
                console.log(`   Count: ${count}`);
            } else {
                console.error(`❌ Model '${model}' DOES NOT exist on PrismaClient.`);
            }
        }

        console.log('Test completed.');
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
