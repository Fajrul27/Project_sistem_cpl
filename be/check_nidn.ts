import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findFirst({
            where: {
                profile: {
                    namaLengkap: {
                        contains: "Fajrul"
                    }
                }
            },
            include: {
                profile: true
            }
        });

        console.log("User found:", user);
        if (user?.profile) {
            console.log("NIDN:", user.profile.nidn);
        } else {
            console.log("Profile not found or user not found");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
