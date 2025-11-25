import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        console.log('Checking users in database...\n');

        const userCount = await prisma.user.count();
        console.log(`Total users: ${userCount}\n`);

        if (userCount > 0) {
            const users = await prisma.user.findMany({
                include: {
                    role: true,
                    profile: true,
                },
                take: 10, // Limit to first 10 users
            });

            console.log('Users in database:');
            console.log('==================\n');

            users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   Role: ${user.role?.role || 'No role'}`);
                console.log(`   Name: ${user.profile?.namaLengkap || 'No name'}`);
                console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
                console.log(`   Created: ${user.createdAt.toLocaleString()}`);
                console.log('');
            });
        } else {
            console.log('No users found in database.');
        }

    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
