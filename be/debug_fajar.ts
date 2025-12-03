
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const nama = 'Fajar Nugraha';
    console.log(`Searching for profile with name: ${nama}`);

    try {
        const profile = await prisma.profile.findFirst({
            where: {
                namaLengkap: {
                    contains: nama
                }
            },
            include: {
                angkatanRef: true,
                user: true
            }
        });

        if (profile) {
            console.log('Profile found:');
            console.log(JSON.stringify(profile, null, 2));
        } else {
            console.log('Profile not found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
