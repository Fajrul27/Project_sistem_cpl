import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const role = 'mahasiswa';
    const resource = 'mata_kuliah';

    console.log(`Checking permissions for role: ${role}`);

    const allPerms = await prisma.rolePermission.findMany({
        where: {
            role: role
        }
    });

    console.log('Total perms for mahasiswa:', allPerms.length);

    const mkPerms = allPerms.filter(p => p.resource === resource);
    console.log('Mata Kuliah perms:', mkPerms);

    // Check if any other perms might be relevant
    const viewPerms = allPerms.filter(p => p.action === 'view' && p.isEnabled);
    console.log('Enabled VIEW perms:', viewPerms.map(p => p.resource));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
