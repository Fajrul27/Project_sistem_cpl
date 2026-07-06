import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const existingUser = await prisma.user.findUnique({
        where: { email: 'mhs01@gmail.com' },
        include: { profile: true }
    });
    console.log("Before:", existingUser.profile.semester);
    
    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            profile: {
                update: {
                    semester: 7
                }
            }
        }
    });
    
    const after = await prisma.user.findUnique({
        where: { email: 'mhs01@gmail.com' },
        include: { profile: true }
    });
    console.log("After:", after.profile.semester);
}
main().catch(console.error).finally(() => prisma.$disconnect());
