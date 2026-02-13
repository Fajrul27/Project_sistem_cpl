
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWeights() {
    try {
        const weights = await prisma.cplMataKuliah.findMany();

        console.log(`Total mappings: ${weights.length}`);

        const distribution = {};
        let nullCount = 0;

        weights.forEach(w => {
            const val = Number(w.bobotKontribusi);
            if (w.bobotKontribusi === null) {
                nullCount++;
            } else {
                distribution[val] = (distribution[val] || 0) + 1;
            }
        });

        console.log('Weight Distribution:');
        console.log(distribution);
        console.log(`Null weights: ${nullCount}`);

        // Check specific examples if any non-1.0 exist
        const nonStandard = weights.filter(w => Number(w.bobotKontribusi) !== 1.0);
        if (nonStandard.length > 0) {
            console.log('Examples of non-1.0 weights:');
            console.log(nonStandard.slice(0, 5));
        } else {
            console.log('No non-1.0 weights found. All weights are likely 1.0 or null.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkWeights();
