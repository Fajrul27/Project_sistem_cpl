import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function exportDefaultPermissions() {
    try {
        const defaults = await prisma.defaultRolePermission.findMany({
            include: { role: true },
            orderBy: [
                { role: { name: 'asc' } },
                { resource: 'asc' },
                { action: 'asc' }
            ]
        });

        // Group by role
        const byRole: Record<string, Record<string, Record<string, boolean>>> = {};

        defaults.forEach(d => {
            const roleName = d.role.name;
            if (!byRole[roleName]) byRole[roleName] = {};
            if (!byRole[roleName][d.resource]) byRole[roleName][d.resource] = {};
            byRole[roleName][d.resource][d.action] = d.isEnabled;
        });

        // Generate TypeScript code for shouldHaveAccess
        console.log('='.repeat(80));
        console.log('CURRENT DEFAULT PERMISSIONS DATA:');
        console.log('='.repeat(80));
        console.log(JSON.stringify(byRole, null, 2));
        console.log('\n' + '='.repeat(80));
        console.log('GENERATING shouldHaveAccess FUNCTION:');
        console.log('='.repeat(80));

        // Generate logic for each role
        for (const [roleName, resources] of Object.entries(byRole)) {
            console.log(`\n// ${roleName.toUpperCase()}`);
            console.log(`if (role === '${roleName}') {`);

            const enabledResources = new Set<string>();
            const resourceActions: Record<string, string[]> = {};

            Object.entries(resources).forEach(([resource, actions]) => {
                const enabledActions = Object.entries(actions)
                    .filter(([_, enabled]) => enabled)
                    .map(([action, _]) => action);

                if (enabledActions.length > 0) {
                    enabledResources.add(resource);
                    resourceActions[resource] = enabledActions;
                }
            });

            // Group resources by same action pattern
            const actionPatterns: Record<string, string[]> = {};
            Object.entries(resourceActions).forEach(([resource, actions]) => {
                const pattern = actions.sort().join(',');
                if (!actionPatterns[pattern]) actionPatterns[pattern] = [];
                actionPatterns[pattern].push(resource);
            });

            console.log(`    Resources with permissions:`);
            Object.entries(actionPatterns).forEach(([pattern, resources]) => {
                console.log(`    - ${resources.join(', ')}: ${pattern}`);
            });

            console.log(`}`);
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

exportDefaultPermissions();
