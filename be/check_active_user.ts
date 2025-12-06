
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkActiveSession() {
    try {
        // Find most recent session
        const session = await prisma.session.findFirst({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    include: {
                        profile: {
                            include: { prodi: true }
                        },
                        role: true
                    }
                }
            }
        });

        if (!session) {
            console.log("No active session found.");
            return;
        }

        console.log("Most Recent Session User:");
        console.log("Email:", session.user.email);
        console.log("Role:", session.user.role?.role);
        console.log("Prodi ID:", session.user.profile?.prodiId);
        console.log("Prodi Name:", session.user.profile?.prodi?.nama);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkActiveSession();
