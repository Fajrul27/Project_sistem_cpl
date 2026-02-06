import { PrismaClient } from '@prisma/client';
import { withoutAuditLog, getCurrentContext } from '../lib/context.js';

const prisma = new PrismaClient();
const basePrisma = new PrismaClient();

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
        const userId = getCurrentContext()?.userId;

        // Perform batch operations WITHOUT auto-logging
        const count = await withoutAuditLog(async () => {
            // Clear existing defaults
            await prisma.defaultRolePermission.deleteMany();

            const resources = [
                'dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk',
                'nilai_teknik', 'kuesioner', 'dosen_pengampu', 'kaprodi_data', 'mahasiswa',
                'users', 'transkrip_cpl', 'analisis_cpl', 'evaluasi_cpl', 'rekap_kuesioner',
                'settings', 'evaluasi_mk', 'role_permissions', 'default_role_permissions', 'fakultas',
                'roles', 'audit_log', 'tahun_ajaran'
            ];

            const actions = ['view', 'create', 'edit', 'delete', 'view_all', 'verify'];
            const targetRoles = ['admin', 'dosen', 'kaprodi', 'mahasiswa']; // Roles that have defaults

            // Get Role IDs
            const roles = await prisma.role.findMany({
                where: { name: { in: targetRoles } }
            });
            const rolesMap = new Map(roles.map(r => [r.name, r.id]));

            const defaultPermissions: any[] = [];

            // Helper logic for system default permissions (auto-generated from database)
            const shouldHaveAccess = (role: string, resource: string, action: string): boolean => {
                // 1. ADMIN: Has access to EVERYTHING
                if (role === 'admin') return true;

                // 2. KAPRODI
                if (role === 'kaprodi') {
                    // Full CRUD + view_all access
                    // Full CRUD + view_all access
                    if (['analisis_cpl', 'cpl', 'cpmk', 'dosen_pengampu', 'evaluasi_cpl', 'mahasiswa', 'mata_kuliah', 'nilai_teknik', 'profil_lulusan', 'visi_misi'].includes(resource)) {
                        return ['view', 'create', 'edit', 'delete', 'view_all'].includes(action);
                    }
                    // Tahun Ajaran: View only (Admin manages this)
                    if (resource === 'tahun_ajaran') {
                        return ['view', 'view_all'].includes(action);
                    }
                    // Dashboard: edit, verify, view
                    if (resource === 'dashboard') {
                        return ['edit', 'verify', 'view'].includes(action);
                    }
                    // Evaluasi MK: Full access including verify
                    if (resource === 'evaluasi_mk') {
                        return ['view', 'create', 'edit', 'delete', 'verify', 'view_all'].includes(action);
                    }
                    // View + view_all only
                    if (['fakultas', 'rekap_kuesioner'].includes(resource)) {
                        return ['view', 'view_all'].includes(action);
                    }
                    // View only
                    if (['settings', 'transkrip_cpl', 'users'].includes(resource)) {
                        return action === 'view';
                    }
                    return false;
                }

                // 3. DOSEN
                if (role === 'dosen') {
                    // Full CRUD access
                    if (['cpmk', 'nilai_teknik'].includes(resource)) {
                        return ['view', 'create', 'edit', 'delete'].includes(action);
                    }
                    // Create + view only for evaluasi_cpl
                    if (resource === 'evaluasi_cpl') {
                        return ['view', 'create'].includes(action);
                    }
                    // Evaluasi MK: create, edit, view (no delete/verify)
                    if (resource === 'evaluasi_mk') {
                        return ['view', 'create', 'edit'].includes(action);
                    }
                    // View only access
                    if (['analisis_cpl', 'cpl', 'dashboard', 'mahasiswa', 'mata_kuliah', 'profil_lulusan', 'transkrip_cpl', 'visi_misi'].includes(resource)) {
                        return action === 'view';
                    }
                    return false;
                }

                // 4. MAHASISWA
                if (role === 'mahasiswa') {
                    // View only access
                    // View only access
                    if (['dashboard', 'mata_kuliah', 'profil_lulusan', 'transkrip_cpl', 'visi_misi'].includes(resource)) {
                        return action === 'view';
                    }
                    // Kuesioner: Fill (Create/Edit) + View
                    if (resource === 'kuesioner') {
                        return ['view', 'create', 'edit'].includes(action);
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

            return defaultPermissions.length;
        });

        // Create single manual audit log entry
        if (userId) {
            await basePrisma.auditLog.create({
                data: {
                    userId,
                    action: 'RESET_DEFAULTS',
                    tableName: 'DefaultRolePermission',
                    recordId: null,
                    oldData: null,
                    newData: JSON.stringify({
                        message: `Reset ${count} default permissions ke sistem`,
                        count
                    }),
                    ipAddress: 'unknown',
                    userAgent: 'unknown'
                }
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
            'settings', 'evaluasi_mk', 'kuesioner', 'audit_log', 'tahun_ajaran'
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

    // Update defaults for a specific role
    static async updateRoleDefaults(roleId: string, permissions: Array<{ resource: string; action: string; isEnabled: boolean }>) {
        // Delete existing defaults for this role
        await prisma.defaultRolePermission.deleteMany({
            where: { roleId }
        });

        // Create new defaults
        const defaultPermissions = permissions.map(p => ({
            roleId,
            resource: p.resource,
            action: p.action,
            isEnabled: p.isEnabled
        }));

        if (defaultPermissions.length > 0) {
            await prisma.defaultRolePermission.createMany({
                data: defaultPermissions,
                skipDuplicates: true
            });
        }

        return await this.getDefaultsByRoleId(roleId);
    }

    // Export defaults as JSON
    static async exportDefaults() {
        const defaults = await this.getAllDefaults();
        return {
            exportDate: new Date().toISOString(),
            defaults: defaults.map(d => ({
                roleName: d.role.name,
                resource: d.resource,
                action: d.action,
                isEnabled: d.isEnabled
            }))
        };
    }

    // Import defaults from JSON
    static async importDefaults(data: any) {
        if (!data.defaults || !Array.isArray(data.defaults)) {
            throw new Error('Invalid import data format');
        }

        // Get all roles
        const roles = await prisma.role.findMany();
        const rolesMap = new Map(roles.map(r => [r.name, r.id]));

        // Clear existing defaults
        await prisma.defaultRolePermission.deleteMany();

        // Create new defaults
        const defaultPermissions = data.defaults
            .filter((d: any) => rolesMap.has(d.roleName))
            .map((d: any) => ({
                roleId: rolesMap.get(d.roleName)!,
                resource: d.resource,
                action: d.action,
                isEnabled: d.isEnabled
            }));

        if (defaultPermissions.length > 0) {
            await prisma.defaultRolePermission.createMany({
                data: defaultPermissions,
                skipDuplicates: true
            });
        }

        return await this.getAllDefaults();
    }
}
