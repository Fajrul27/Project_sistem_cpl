import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'dosen9@unugha.ac.id';
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            role: true
        }
    });

    if (user) {
        console.log('User Email:', user.email);
        console.log('Role in DB:', user.role?.role);
    } else {
        console.log('User not found');
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
