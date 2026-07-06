import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const p = await prisma.profile.findFirst({ where: { user: { email: 'mhs01@gmail.com' } } });
    console.log(p);
}
main().finally(() => prisma.$disconnect());
