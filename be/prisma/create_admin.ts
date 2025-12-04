import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@unugha.ac.id';
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`Creating admin account: ${email}`);

    // Check if user exists to handle profile creation logic better
    const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { profile: true, role: true }
    });

    if (existingUser) {
        console.log('User exists, updating password and role...');
        await prisma.user.update({
            where: { email },
            data: {
                passwordHash,
                isActive: true,
                emailVerified: true,
                role: {
                    upsert: {
                        create: { role: 'admin' },
                        update: { role: 'admin' }
                    }
                }
            }
        });

        // Ensure profile exists
        if (!existingUser.profile) {
            await prisma.profile.create({
                data: {
                    userId: existingUser.id,
                    namaLengkap: 'Administrator',
                    programStudi: 'Pusat',
                    fotoProfile: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
                }
            });
        }
    } else {
        console.log('User does not exist, creating new admin...');
        await prisma.user.create({
            data: {
                email,
                passwordHash,
                isActive: true,
                emailVerified: true,
                role: {
                    create: { role: 'admin' }
                },
                profile: {
                    create: {
                        namaLengkap: 'Administrator',
                        programStudi: 'Pusat',
                        fotoProfile: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
                    }
                }
            }
        });
    }

    console.log('✅ Admin account created/updated successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
