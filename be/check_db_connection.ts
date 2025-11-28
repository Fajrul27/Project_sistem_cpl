import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected successfully.');

        console.log('Counting CPLs...');
        const count = await prisma.cpl.count();
        console.log(`Found ${count} CPLs.`);

        console.log('Counting Users...');
        const userCount = await prisma.user.count();
        console.log(`Found ${userCount} Users.`);

        console.log('Counting Prodi...');
        const prodiCount = await prisma.prodi.count();
        console.log(`Found ${prodiCount} Prodi.`);

        console.log('Counting Fakultas...');
        const fakultasCount = await prisma.fakultas.count();
        console.log(`Found ${fakultasCount} Fakultas.`);

        console.log('Fetching one Prodi with Fakultas...');
        const prodi = await prisma.prodi.findFirst({
            include: { fakultas: true }
        });
        console.log('Prodi sample:', prodi ? prodi.nama : 'None');

    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
