import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMahasiswaPermission() {
    try {
        // Get mahasiswa role
        const mahasiswaRole = await prisma.role.findUnique({
            where: { name: 'mahasiswa' }
        });

        if (!mahasiswaRole) {
            console.error('Mahasiswa role not found!');
            process.exit(1);
        }

        // Update mata_kuliah view permission for mahasiswa
        const updated = await prisma.defaultRolePermission.upsert({
            where: {
                roleId_resource_action: {
                    roleId: mahasiswaRole.id,
                    resource: 'mata_kuliah',
                    action: 'view'
                }
            },
            update: {
                isEnabled: true
            },
            create: {
                roleId: mahasiswaRole.id,
                resource: 'mata_kuliah',
                action: 'view',
                isEnabled: true
            }
        });

        console.log('✅ Successfully enabled mata_kuliah view permission for mahasiswa');
        console.log('Updated permission:', updated);

        // Also update actual permissions if they exist
        const mahasiswaUsers = await prisma.user.findMany({
            where: {
                role: {
                    role: {
                        name: 'mahasiswa'
                    }
                }
            },
            select: { id: true }
        });

        console.log(`Found ${mahasiswaUsers.length} mahasiswa users`);

        // Update permissions for all mahasiswa users
        for (const user of mahasiswaUsers) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_resource_action: {
                        roleId: mahasiswaRole.id,
                        resource: 'mata_kuliah',
                        action: 'view'
                    }
                },
                update: {
                    isEnabled: true
                },
                create: {
                    roleId: mahasiswaRole.id,
                    resource: 'mata_kuliah',
                    action: 'view',
                    isEnabled: true
                }
            });
        }

        console.log('✅ Updated actual permissions for all mahasiswa users');

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

updateMahasiswaPermission();
