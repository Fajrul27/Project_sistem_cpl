import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Checking for any low CPL scores...");
    const scores = await prisma.nilaiCpl.groupBy({
        by: ['mahasiswaId', 'cplId'],
        _avg: { nilai: true }
    });
    
    const lowScores = scores.filter(s => s._avg.nilai && s._avg.nilai.toNumber() < 55);
    console.log(`Found ${lowScores.length} averaged CPL scores below 55.`);
    
    if (lowScores.length > 0) {
        console.log("Sample low scores:", lowScores.slice(0, 5));
    }
    
    await prisma.$disconnect();
}

main().catch(console.error);
