import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'dosen9@unugha.ac.id';
    const newRole = 'kaprodi';

    console.log(`Updating role for ${email} to ${newRole}...`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    // Update role in UserRole table
    await prisma.userRole.upsert({
        where: { userId: user.id },
        update: { role: newRole },
        create: { userId: user.id, role: newRole }
    });

    console.log('Role updated successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
