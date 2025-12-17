
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Searching for 'Administrator'...");
    const users = await prisma.user.findMany({
        where: {
            profile: {
                namaLengkap: {
                    contains: 'Administrator'
                }
            }
        },
        include: {
            role: true,
            profile: true
        }
    });

    if (users.length === 0) {
        console.log("No user found with name containing 'Administrator'");
    } else {
        users.forEach(u => {
            console.log(`FOUND USER:`);
            console.log(`Email: ${u.email}`);
            console.log(`Name: ${u.profile?.namaLengkap}`);
            console.log(`Role: ${u.role?.role || 'NONE'}`);
        });
    }
}

main()
    .catch(e => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
