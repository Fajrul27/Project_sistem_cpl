
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const profiles = await prisma.profile.findMany({
        select: { programStudi: true },
        distinct: ['programStudi'],
        where: { programStudi: { not: null } }
    });

    const kaprodi = await prisma.kaprodiData.findMany();

    const output = {
        profiles: profiles,
        kaprodi: kaprodi
    };

    fs.writeFileSync('profiles_output.json', JSON.stringify(output, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
