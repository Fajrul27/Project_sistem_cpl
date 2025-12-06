
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkChars() {
    try {
        const item = await prisma.penilaianTidakLangsung.findFirst();
        if (item) {
            console.log(`Value: "${item.tahunAjaran}"`);
            console.log("Char Codes:");
            for (let i = 0; i < item.tahunAjaran.length; i++) {
                console.log(`${item.tahunAjaran[i]}: ${item.tahunAjaran.charCodeAt(i)}`);
            }
        } else {
            console.log("No items found.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkChars();
