
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initializeFromHardcoded() {
    // Clear existing defaults
    await prisma.defaultRolePermission.deleteMany();

    const resources = [
        'dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk',
        'nilai_teknik', 'kuesioner', 'dosen_pengampu', 'kaprodi_data', 'mahasiswa',
        'users', 'transkrip_cpl', 'analisis_cpl', 'evaluasi_cpl', 'rekap_kuesioner',
        'settings', 'evaluasi_mk', 'role_permissions', 'default_role_permissions', 'fakultas',
        'roles', 'audit_log'
    ];

    const actions = ['view', 'create', 'edit', 'delete', 'view_all', 'verify'];
    const targetRoles = ['admin', 'dosen', 'kaprodi', 'mahasiswa']; // Roles that have defaults

    // Get Role IDs
    const roles = await prisma.role.findMany({
        where: { name: { in: targetRoles } }
    });
    const rolesMap = new Map(roles.map(r => [r.name, r.id]));

    const defaultPermissions: any[] = [];

    // Helper logic (same as was in controller)
    const shouldHaveAccess = (role: string, resource: string, action: string): boolean => {
        // 1. ADMIN: Has access to EVERYTHING
        if (role === 'admin') return true;

        // 2. KAPRODI
        if (role === 'kaprodi') {
            // Full Management Access (CRUD)
            if (['visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk', 'kaprodi_data', 'mahasiswa', 'evaluasi_cpl', 'analisis_cpl', 'evaluasi_mk', 'dosen_pengampu', 'nilai_teknik'].includes(resource)) {
                if (resource === 'evaluasi_mk' && action === 'verify') return true;
                if (action === 'view_all') return true;
                return ['view', 'create', 'edit', 'delete'].includes(action);
            }
            // View Only Access
            if (['dashboard', 'users', 'transkrip_cpl', 'rekap_kuesioner', 'settings', 'fakultas'].includes(resource)) {
                if (action === 'view_all') return resource === 'rekap_kuesioner' || resource === 'fakultas';
                return action === 'view';
            }
            return false;
        }

        // 3. DOSEN
        if (role === 'dosen') {
            // Operational Access
            if (['nilai_teknik', 'evaluasi_cpl', 'evaluasi_mk'].includes(resource)) {
                if (resource === 'evaluasi_mk') return ['view', 'edit', 'create'].includes(action);
                return true;
            }
            // View Only Access
            if (['dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk', 'mahasiswa', 'transkrip_cpl', 'analisis_cpl', 'users', 'fakultas'].includes(resource)) {
                if (resource === 'fakultas' && action === 'view') return true;
                return action === 'view';
            }
            return false;
        }

        // 4. MAHASISWA
        if (role === 'mahasiswa') {
            // Input Kuesioner
            if (resource === 'kuesioner') {
                return ['view', 'create', 'edit'].includes(action);
            }
            // View Only Access
            if (['dashboard', 'visi_misi', 'profil_lulusan', 'transkrip_cpl', 'fakultas'].includes(resource)) {
                return action === 'view';
            }
            return false;
        }

        return false;
    };

    for (const resource of resources) {
        for (const roleName of targetRoles) {
            const roleId = rolesMap.get(roleName);
            if (!roleId) continue;

            for (const action of actions) {
                const isEnabled = shouldHaveAccess(roleName, resource, action);
                defaultPermissions.push({
                    roleId,
                    resource,
                    action,
                    isEnabled
                });
            }
        }
    }

    if (defaultPermissions.length > 0) {
        await prisma.defaultRolePermission.createMany({
            data: defaultPermissions,
            skipDuplicates: true
        });
    }

    return defaultPermissions;
}

async function main() {
    console.log('Checking Roles...');
    const roles = await prisma.role.findMany();
    console.log('Roles found:', roles.map(r => r.name));

    console.log('\nRunning initializeFromHardcoded()...');
    const result = await initializeFromHardcoded();
    console.log('Result count:', result.length);

    console.log('\nChecking Default Permissions for "roles" resource AFTER init...');
    const defaults = await prisma.defaultRolePermission.findMany({
        where: {
            resource: 'roles'
        },
        include: {
            role: true
        }
    });
    console.log('Default permissions for "roles":', defaults.map(d => ({ role: d.role.name, resource: d.resource, action: d.action, isEnabled: d.isEnabled })));

    // Check specifically for admin
    const adminDefaults = defaults.filter(d => d.role.name === 'admin');
    console.log('Admin defaults for "roles":', adminDefaults.length);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
