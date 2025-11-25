
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Deeper Normalization Candidates ---');

    // Check Cpmk Level Taksonomi
    const levelTaksonomi = await prisma.cpmk.groupBy({
        by: ['levelTaksonomi'],
        _count: { levelTaksonomi: true }
    });
    console.log('\n1. Cpmk Level Taksonomi:', JSON.stringify(levelTaksonomi, null, 2));

    // Check Cpmk Status Validasi
    const statusValidasi = await prisma.cpmk.groupBy({
        by: ['statusValidasi'],
        _count: { statusValidasi: true }
    });
    console.log('\n2. Cpmk Status Validasi:', JSON.stringify(statusValidasi, null, 2));

    // Check AuditLog Action
    const auditActions = await prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true }
    });
    console.log('\n3. AuditLog Actions:', JSON.stringify(auditActions, null, 2));

    // Check MataKuliah Semester (Just to see if it's strictly 1-8 or weird)
    const mkSemester = await prisma.mataKuliah.groupBy({
        by: ['semester'],
        _count: { semester: true },
        orderBy: { semester: 'asc' }
    });
    console.log('\n4. MataKuliah Semester:', JSON.stringify(mkSemester, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
