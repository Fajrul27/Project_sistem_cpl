import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Converting angkatan table collation...');
        await prisma.$executeRaw`ALTER TABLE angkatan CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
        console.log('Successfully converted angkatan table collation.');

        // Verify
        const collations = await prisma.$queryRaw`
      SELECT 
        TABLE_NAME, 
        TABLE_COLLATION 
      FROM 
        INFORMATION_SCHEMA.TABLES 
      WHERE 
        TABLE_SCHEMA = 'sistem_cpl' AND 
        TABLE_NAME = 'angkatan';
    `;
        console.log('New Angkatan collation:', collations);

    } catch (e) {
        console.error('Error converting collation:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
