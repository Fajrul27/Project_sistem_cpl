
import { PrismaClient } from '@prisma/client';
import { TranskripService } from '../server/services/TranskripService';

const prisma = new PrismaClient();

async function main() {
    const namePart = 'Budi Rahayu';
    const profile = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: namePart } },
        include: { user: true }
    });

    if (!profile) return console.error("User not found");

    // Check duplicates
    const grades = await prisma.nilaiCpmk.findMany({
        where: { mahasiswaId: profile.userId },
        orderBy: { updatedAt: 'desc' }
    });

    console.log(`Total Grades: ${grades.length}`);

    const seen = new Set<string>();
    const toDelete: string[] = [];

    for (const g of grades) {
        // Unique key should usually be CPMK ID only if we want 1 grade per CPMK ever
        // OR semester/year specific.
        // Assuming we only want 1 grade per CPMK for this transcript view:
        if (seen.has(g.cpmkId)) {
            toDelete.push(g.id);
        } else {
            seen.add(g.cpmkId);
        }
    }

    console.log(`Found ${toDelete.length} duplicate CPMK grades (multiple entries for same CPMK).`);

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} duplicates...`);
        await prisma.nilaiCpmk.deleteMany({
            where: { id: { in: toDelete } }
        });
        console.log("duplicates deleted.");
    } else {
        console.log("No duplicates found to delete.");
    }

    // Now recalculate
    console.log('Recalculating Transkrip...');
    try {
        const processed = await TranskripService.calculateTranskrip(profile.userId);
        console.log(`Successfully calculated transcript for ${processed} courses.`);

        // Final count verify
        const finalCount = await prisma.nilaiCpmk.count({ where: { mahasiswaId: profile.userId } });
        console.log(`Final CPMK Grade Count: ${finalCount}`);

    } catch (error) {
        console.error('Error calculating:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
