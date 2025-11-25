import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'mysql://root:@localhost:3306/sistem_cpl?multipleStatements=true',
        },
    },
});

async function main() {
    console.log('Reading SQL file...');
    const sqlPath = path.join(__dirname, '../sistem_cpl.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Dropping existing tables...');
    try {
        // Disable foreign key checks to allow dropping tables
        await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

        const tables: any[] = await prisma.$queryRaw`SHOW TABLES`;
        const dbName = 'sistem_cpl'; // Or extract from env
        const tableKey = `Tables_in_${dbName}`;

        // If tableKey doesn't match, try to guess or just map
        for (const table of tables) {
            const tableName = Object.values(table)[0] as string;
            if (tableName) {
                await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`${tableName}\`;`);
                console.log(`Dropped table ${tableName}`);
            }
        }
    } catch (e) {
        console.warn('Error dropping tables (might be empty):', e);
    }

    console.log('Importing SQL dump...');
    // Execute the whole script
    // Note: This requires multipleStatements=true in connection string
    try {
        await prisma.$executeRawUnsafe(sqlContent);
        console.log('Import successful!');
    } catch (e) {
        console.error('Error importing SQL:', e);
        // Fallback: Split by delimiter if possible, but simple split is risky.
        // If multipleStatements fails, we might need another strategy.
    } finally {
        await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
