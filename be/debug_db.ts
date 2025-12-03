import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const collations = await prisma.$queryRaw`
      SELECT 
        TABLE_NAME, 
        TABLE_COLLATION 
      FROM 
        INFORMATION_SCHEMA.TABLES 
      WHERE 
        TABLE_SCHEMA = 'sistem_cpl' AND 
        TABLE_NAME IN ('profiles', 'angkatan', 'users', 'prodi', 'fakultas', 'semester', 'kelas');
    `;
        console.log('Table collations:', collations);

        const columnCollations = await prisma.$queryRaw`
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        COLLATION_NAME 
      FROM 
        INFORMATION_SCHEMA.COLUMNS 
      WHERE 
        TABLE_SCHEMA = 'sistem_cpl' AND 
        TABLE_NAME IN ('profiles', 'angkatan') AND
        COLUMN_NAME IN ('id', 'angkatan_id');
    `;
        console.log('Column collations:', columnCollations);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
