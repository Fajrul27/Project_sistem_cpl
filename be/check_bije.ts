import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBijeData() {
    // Find user
    const user = await prisma.user.findFirst({
        where: { email: { contains: 'bije' } },
        include: { role: true }
    });

    if (!user) {
        console.log('User bije tidak ditemukan');
        return;
    }

    console.log(`User ID: ${user.id}, Email: ${user.email}, Role: ${user.role?.role}`);

    // Check profile
    const profile = await prisma.profile.findUnique({
        where: { userId: user.id }
    });

    console.log(`\nProfile prodiId: ${profile?.prodiId || 'NULL'}`);
    console.log(`Profile programStudi: ${profile?.programStudi || 'NULL'}`);

    // Check teaching
    const teaching = await prisma.mataKuliahPengampu.findMany({
        where: { dosenId: user.id },
        include: { mataKuliah: true }
    });

    console.log(`\nJumlah Mata Kuliah yang Diampu: ${teaching.length}`);
    teaching.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.mataKuliah.namaMk}`);
        console.log(`     prodiId: ${t.mataKuliah.prodiId || 'NULL'}`);
        console.log(`     programStudi: ${t.mataKuliah.programStudi || 'NULL'}`);
    });

    // Check all CPL
    const allCpl = await prisma.cpl.findMany({
        where: { isActive: true },
        select: { id: true, kodeCpl: true, prodiId: true }
    });

    console.log(`\nTotal CPL aktif: ${allCpl.length}`);
    const cplWithProdi = allCpl.filter(c => c.prodiId);
    const cplWithoutProdi = allCpl.filter(c => !c.prodiId);
    console.log(`  - Dengan prodiId: ${cplWithProdi.length}`);
    console.log(`  - Tanpa prodiId: ${cplWithoutProdi.length}`);

    await prisma.$disconnect();
}

checkBijeData().catch(console.error);
