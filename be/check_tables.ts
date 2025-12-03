import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const angkatan = await prisma.$queryRaw`SHOW CREATE TABLE angkatan`;
    console.log('Angkatan Table:', JSON.stringify(angkatan, null, 2));
  } catch (e: any) {
    console.log('Angkatan table error:', e.message);
  }

  try {
    const profiles = await prisma.$queryRaw`SHOW CREATE TABLE profiles`;
    console.log('Profiles Table:', JSON.stringify(profiles, null, 2));
  } catch (e: any) {
    console.log('Profiles table error:', e.message);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
