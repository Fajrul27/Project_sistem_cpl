import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const refs = await prisma.teknikPenilaianRef.findMany();
    console.log(refs);
}
main();
