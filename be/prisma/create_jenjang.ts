
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating Jenjang table manually...');
    try {
        // Check if table exists
        const check = await prisma.$queryRaw`SHOW TABLES LIKE 'jenjang'`;
        if ((check as any[]).length > 0) {
            console.log('Table jenjang already exists.');
            return;
        }

        await prisma.$executeRawUnsafe(`
      CREATE TABLE jenjang (
        id VARCHAR(191) NOT NULL,
        nama VARCHAR(191) NOT NULL,
        keterangan TEXT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL,
        UNIQUE INDEX jenjang_nama_key(nama),
        PRIMARY KEY (id)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
        console.log("Table Jenjang created successfully.");
    } catch (e) {
        console.error("Error creating table:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
