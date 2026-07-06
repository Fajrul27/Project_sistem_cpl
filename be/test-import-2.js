import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await prisma.user.create({
            data: {
                email: 'mhs10@gmail.com',
                passwordHash: hashedPassword,
                role: {
                    create: {
                        role: {
                            connect: { name: 'mahasiswa' }
                        }
                    }
                },
                profile: {
                    create: {
                        nim: '22E010010',
                        namaLengkap: 'Cholifah Kusuma Dewi',
                        semester: 8,
                        prodiId: null,
                        kelasId: null
                    }
                }
            }
        });
        console.log("Success!");
    } catch (e) {
        console.error("Prisma Error:", e);
    }
}
main().finally(() => prisma.$disconnect());
