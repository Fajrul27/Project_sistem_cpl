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

    // Initialize defaults from hardcoded values
    static async initializeFromHardcoded() {
        // First, get role IDs
        const roles = await prisma.role.findMany();
        const roleMap = new Map(roles.map(r => [r.name, r.id]));

        const adminId = roleMap.get('admin')!;
        const kaprodiId = roleMap.get('kaprodi')!;
        const dosenId = roleMap.get('dosen')!;
        const mahasiswaId = roleMap.get('mahasiswa')!;
        const dekanId = roleMap.get('dekan')!;

        const defaultPermissions = [
            // Admin - Full access to everything
            ...['dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk',
                'nilai_teknik', 'transkrip_cpl', 'analisis_cpl', 'evaluasi_cpl', 'rekap_kuesioner',
                'dosen_pengampu', 'kaprodi_data', 'mahasiswa', 'users', 'fakultas',
                'roles', 'role_permissions', 'default_role_permissions',
                'evaluasi_mk', 'kuesioner'].flatMap(resource =>
                    ['view', 'create', 'edit', 'delete', 'view_all', 'verify'].map(action => ({
                        roleId: adminId,
                        resource,
                        action,
                        isEnabled: true
                    }))
                ),

            // Kaprodi - Most CRUD except users & role_access
            ...['visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk', 'evaluasi_cpl',
                'analisis_cpl', 'rekap_kuesioner', 'dosen_pengampu', 'evaluasi_mk', 'mahasiswa'].flatMap(resource =>
                    ['view', 'create', 'edit', 'delete', 'view_all', 'verify'].map(action => ({
                        roleId: kaprodiId,
                        resource,
                        action,
                        isEnabled: true
                    }))
                ),
            // Kaprodi - View only
            ...['dashboard', 'nilai_teknik', 'transkrip_cpl', 'users'].flatMap(resource => [{
                roleId: kaprodiId,
                resource,
                action: 'view',
                isEnabled: true
            }]),

            // Dosen - Edit evaluasi & nilai_teknik
            ...['nilai_teknik', 'evaluasi_cpl', 'evaluasi_mk'].flatMap(resource =>
                ['view', 'create', 'edit', 'delete', 'view_all', 'verify'].map(action => ({
                    roleId: dosenId,
                    resource,
                    action,
                    isEnabled: true
                }))
            ),
            // Dosen - View only
            ...['dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk',
                'transkrip_cpl', 'analisis_cpl', 'mahasiswa'].flatMap(resource => [{
                    roleId: dosenId,
                    resource,
                    action: 'view',
                    isEnabled: true
                }]),

            // Mahasiswa - Can fill kuesioner
            ...['kuesioner'].flatMap(resource =>
                ['view', 'create', 'edit', 'view_all', 'verify'].map(action => ({
                    roleId: mahasiswaId,
                    resource,
                    action,
                    isEnabled: true
                }))
            ),
            // Mahasiswa - View only
            ...['dashboard', 'visi_misi', 'profil_lulusan', 'transkrip_cpl'].flatMap(resource => [{
                roleId: mahasiswaId,
                resource,
                action: 'view',
                isEnabled: true
            }]),

            // Dekan - View Access (Dashboard, Academics, Reports)
            ...['dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk',
                'transkrip_cpl', 'analisis_cpl', 'evaluasi_cpl', 'rekap_kuesioner',
                'dosen_pengampu', 'kaprodi_data', 'mahasiswa', 'fakultas', 'nilai_teknik'].flatMap(resource => [{
                    roleId: dekanId,
                    resource,
                    action: 'view',
                    isEnabled: true
                }]),

            // Dekan - Executive Actions (Verify/View All)
            ...['analisis_cpl', 'evaluasi_cpl'].flatMap(resource =>
                ['verify', 'view_all'].map(action => ({
                    roleId: dekanId,
                    resource,
                    action,
                    isEnabled: true
                }))
            )
        ];

        // Clear existing defaults
        await prisma.defaultRolePermission.deleteMany();

        // Insert new defaults
        await prisma.defaultRolePermission.createMany({
            data: defaultPermissions,
            skipDuplicates: true
        });

        return await this.getAllDefaults();
    }

    // Update default permissions for a specific role
    static async updateRoleDefaults(roleId: string, permissions: Array<{ resource: string, action: string, isEnabled: boolean }>) {
        // Delete existing defaults for this role
        await prisma.defaultRolePermission.deleteMany({
            where: { roleId }
        });

        // Insert new ones
        const data = permissions.map(p => ({
            roleId,
            resource: p.resource,
            action: p.action,
            isEnabled: p.isEnabled
        }));

        await prisma.defaultRolePermission.createMany({
            data,
            skipDuplicates: true
        });

        return await this.getDefaultsByRoleId(roleId);
    }

    // Export defaults as JSON
    static async exportDefaults() {
        const defaults = await this.getAllDefaults();
        return {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            defaults: defaults.map(d => ({
                role: d.role,
                resource: d.resource,
                action: d.action,
                isEnabled: d.isEnabled
            }))
        };
    }

    // Import defaults from JSON
    static async importDefaults(data: { defaults: Array<{ role: string, resource: string, action: string, isEnabled: boolean }> }) {
        // Validate
        if (!data.defaults || !Array.isArray(data.defaults)) {
            throw new Error('Invalid import format');
        }

        // Clear existing
        await prisma.defaultRolePermission.deleteMany();

        // Import new
        await prisma.defaultRolePermission.createMany({
            data: data.defaults as any,
            skipDuplicates: true
        });

        return await this.getAllDefaults();
    }
    // Initialize default permissions for a new role (all disabled by default)
    static async initializePermissionsForNewRole(roleId: string) {
        const ALL_RESOURCES = [
            'dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk',
            'nilai_teknik', 'transkrip_cpl', 'analisis_cpl', 'evaluasi_cpl', 'rekap_kuesioner',
            'dosen_pengampu', 'kaprodi_data', 'mahasiswa', 'users', 'fakultas',
            'roles', 'role_permissions', 'default_role_permissions',
            'evaluasi_mk', 'kuesioner', 'input_nilai_teknik', 'isi_kuesioner_cpl'
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
