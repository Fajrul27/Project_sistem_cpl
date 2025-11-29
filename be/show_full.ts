import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showFullData() {
    const user = await prisma.user.findFirst({
        where: { email: { contains: 'bije' } }
    });

    if (!user) return;

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id }
    });

    console.log('PROFILE programStudi FULL:');
    console.log(profile?.programStudi);
    console.log('');

    const allProdi = await prisma.prodi.findMany();
    console.log('ALL PRODI NAMES:');
    allProdi.forEach((p, i) => {
        console.log(`${i + 1}. "${p.nama}" | kode: "${p.kode || 'NULL'}"`);
    });

    await prisma.$disconnect();
}

showFullData().catch(console.error);
