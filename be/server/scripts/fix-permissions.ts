
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAndFixPermissions() {
    const perm = await prisma.rolePermission.findUnique({
        where: {
            roleId_resource_action: {
                role: 'dosen',
                resource: 'users',
                action: 'view'
            }
        }
    });

    if (!perm || !perm.isEnabled) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_resource_action: {
                    role: 'dosen',
                    resource: 'users',
                    action: 'view'
                }
            },
            update: { isEnabled: true },
            create: { role: 'dosen', resource: 'users', action: 'view', isEnabled: true }
        });
    } else {
    }
}

checkAndFixPermissions()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
