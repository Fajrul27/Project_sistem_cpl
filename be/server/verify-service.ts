
import { DefaultPermissionService } from './services/DefaultPermissionService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Attempting to import DefaultPermissionService...');
    try {
        console.log('Service loaded.');
        console.log('Running initializeFromHardcoded()...');
        const result = await DefaultPermissionService.initializeFromHardcoded();
        console.log('Result count:', result.length);

        // Check for specific permission
        const check = await prisma.defaultRolePermission.findFirst({
            where: {
                role: { name: 'admin' },
                resource: 'roles',
                action: 'view'
            }
        });
        console.log('Admin view roles permission:', check);

    } catch (error) {
        console.error('Error running service:', error);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
