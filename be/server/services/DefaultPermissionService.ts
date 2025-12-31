import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export class DefaultPermissionService {
    // Get all default permissions
    static async getAllDefaults() {
        return await prisma.defaultRolePermission.findMany({
            orderBy: [
                { role: 'asc' },
                { resource: 'asc' },
                { action: 'asc' }
            ]
        });
    }

    // Get default permissions for a specific role
    static async getDefaultsByRole(role: Role) {
        return await prisma.defaultRolePermission.findMany({
            where: { role },
            orderBy: [
                { resource: 'asc' },
                { action: 'asc' }
            ]
        });
    }

    // Initialize defaults from hardcoded values (same as role-access-controller)
    static async initializeFromHardcoded() {
        const defaultPermissions = [
            // Admin - Full access to everything
            ...['dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk',
                'nilai_teknik', 'transkrip_cpl', 'analisis_cpl', 'evaluasi_cpl', 'rekap_kuesioner',
                'dosen_pengampu', 'kaprodi_data', 'mahasiswa', 'users', 'role_access', 'fakultas',
                'evaluasi_mk', 'kuesioner'].flatMap(resource =>
                    ['view', 'create', 'edit', 'delete'].map(action => ({
                        role: 'admin' as Role,
                        resource,
                        action,
                        isEnabled: true
                    }))
                ),

            // Kaprodi - Most CRUD except users & role_access
            ...['visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk', 'evaluasi_cpl',
                'analisis_cpl', 'rekap_kuesioner', 'dosen_pengampu', 'evaluasi_mk', 'mahasiswa'].flatMap(resource =>
                    ['view', 'create', 'edit', 'delete'].map(action => ({
                        role: 'kaprodi' as Role,
                        resource,
                        action,
                        isEnabled: true
                    }))
                ),
            // Kaprodi - View only
            ...['dashboard', 'nilai_teknik', 'transkrip_cpl', 'users'].flatMap(resource => [{
                role: 'kaprodi' as Role,
                resource,
                action: 'view',
                isEnabled: true
            }]),

            // Dosen - Edit evaluasi & nilai_teknik
            ...['nilai_teknik', 'evaluasi_cpl', 'evaluasi_mk'].flatMap(resource =>
                ['view', 'create', 'edit', 'delete'].map(action => ({
                    role: 'dosen' as Role,
                    resource,
                    action,
                    isEnabled: true
                }))
            ),
            // Dosen - View only
            ...['dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk',
                'transkrip_cpl', 'analisis_cpl', 'mahasiswa'].flatMap(resource => [{
                    role: 'dosen' as Role,
                    resource,
                    action: 'view',
                    isEnabled: true
                }]),

            // Mahasiswa - Can fill kuesioner
            ...['kuesioner'].flatMap(resource =>
                ['view', 'create', 'edit'].map(action => ({
                    role: 'mahasiswa' as Role,
                    resource,
                    action,
                    isEnabled: true
                }))
            ),
            // Mahasiswa - View only
            ...['dashboard', 'visi_misi', 'profil_lulusan', 'transkrip_cpl'].flatMap(resource => [{
                role: 'mahasiswa' as Role,
                resource,
                action: 'view',
                isEnabled: true
            }])
        ];

        // Clear existing defaults
        await prisma.defaultRolePermission.deleteMany();

        // Insert new defaults using createMany with skipDuplicates
        await prisma.defaultRolePermission.createMany({
            data: defaultPermissions,
            skipDuplicates: true
        });

        return await this.getAllDefaults();
    }

    // Update default permissions for a specific role
    static async updateRoleDefaults(role: Role, permissions: Array<{ resource: string, action: string, isEnabled: boolean }>) {
        // Delete existing defaults for this role
        await prisma.defaultRolePermission.deleteMany({
            where: { role }
        });

        // Insert new ones
        const data = permissions.map(p => ({
            role,
            resource: p.resource,
            action: p.action,
            isEnabled: p.isEnabled
        }));

        await prisma.defaultRolePermission.createMany({
            data,
            skipDuplicates: true
        });

        return await this.getDefaultsByRole(role);
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
}
