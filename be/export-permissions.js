const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function exportCurrentDefaults() {
    const defaults = await prisma.defaultRolePermission.findMany({
        include: { role: true },
        orderBy: [{ roleId: 'asc' }, { resource: 'asc' }]
    });

    const byRole = {};
    defaults.forEach(d => {
        const roleName = d.role.name;
        if (!byRole[roleName]) byRole[roleName] = {};
        if (!byRole[roleName][d.resource]) byRole[roleName][d.resource] = {};
        byRole[roleName][d.resource][d.action] = d.isEnabled;
    });

    console.log(JSON.stringify(byRole, null, 2));
    await prisma.$disconnect();
}

exportCurrentDefaults().catch(console.error);
