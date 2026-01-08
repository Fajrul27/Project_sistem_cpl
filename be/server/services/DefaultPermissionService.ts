import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DefaultPermissionService {
    // Get all default permissions
    static async getAllDefaults() {
        return await prisma.defaultRolePermission.findMany({
            include: { role: true },
            orderBy: [
                { roleId: 'asc' },
                { resource: 'asc' },
                { action: 'asc' }
            ]
        });
    }

    // Get default permissions for a specific role by ID
    static async getDefaultsByRoleId(roleId: string) {
        return await prisma.defaultRolePermission.findMany({
            where: { roleId },
            include: { role: true },
            orderBy: [
                { resource: 'asc' },
                { action: 'asc' }
            ]
        });
    }

    // Initialize defaults from hardcoded values (System Defaults)
    static async initializeFromHardcoded() {
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

        return await this.getAllDefaults();
    }

    // Initialize default permissions for a new role (all disabled by default)
    static async initializePermissionsForNewRole(roleId: string) {
        // Reuse common resource list if possible, or keep as is
        const ALL_RESOURCES = [
            'dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk',
            'nilai_teknik', 'transkrip_cpl', 'analisis_cpl', 'evaluasi_cpl', 'rekap_kuesioner',
            'dosen_pengampu', 'kaprodi_data', 'mahasiswa', 'users', 'fakultas',
            'roles', 'role_permissions', 'default_role_permissions',
            'settings', 'evaluasi_mk', 'kuesioner'
        ];
        const ALL_ACTIONS = ['view', 'create', 'edit', 'delete', 'view_all', 'verify'];

        const defaultPermissions = ALL_RESOURCES.flatMap(resource =>
            ALL_ACTIONS.map(action => ({
                roleId,
                resource,
                action,
                isEnabled: false
            }))
        );

        await prisma.defaultRolePermission.createMany({
            data: defaultPermissions,
            skipDuplicates: true
        });

        return defaultPermissions;
    }
}
