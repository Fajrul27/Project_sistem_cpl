
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAndFixPermissions() {
    console.log('Checking Dosen Users.view permission...');
    const perm = await prisma.rolePermission.findUnique({
        where: {
            role_resource_action: {
                role: 'dosen',
                resource: 'users',
                action: 'view'
            }
        }
    });

    if (!perm || !perm.isEnabled) {
        console.log('Permission missing or disabled. Fixing...');
        await prisma.rolePermission.upsert({
            where: {
                role_resource_action: {
                    role: 'dosen',
                    resource: 'users',
                    action: 'view'
                }
            },
            update: { isEnabled: true },
            create: { role: 'dosen', resource: 'users', action: 'view', isEnabled: true }
        });
        console.log('Fixed Dosen Users.view permission.');
    } else {
        console.log('Permission exists and enabled.');
    }
}

checkAndFixPermissions()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
