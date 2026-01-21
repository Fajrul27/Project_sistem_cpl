
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { DefaultPermissionService } from '../services/DefaultPermissionService.js';

// Get all permissions
export const getPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await prisma.rolePermission.findMany({
            include: { role: true },
            orderBy: [
                { resource: 'asc' },
                { roleId: 'asc' },
                { action: 'asc' }
            ]
        });
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Gagal mengambil data permissions' });
    }
};

// Export current permissions as JSON
export const exportPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await prisma.rolePermission.findMany({
            include: {
                role: { select: { name: true } }
            },
            orderBy: [
                { roleId: 'asc' },
                { resource: 'asc' },
                { action: 'asc' }
            ]
        });

        // Flatten the data for export
        const exportData = {
            exportDate: new Date().toISOString(),
            permissions: permissions.map(p => ({
                roleName: p.role.name,
                resource: p.resource,
                action: p.action,
                isEnabled: p.isEnabled
            }))
        };

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `hak-akses-role-${timestamp}.json`;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json(exportData);
    } catch (error) {
        console.error('Error exporting permissions:', error);
        res.status(500).json({ error: 'Gagal export permissions' });
    }
};

// Update permission (Single or Batch)
export const updatePermission = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        // Handle Batch Update
        if (Array.isArray(data)) {
            const updates = data.map((item: any) =>
                prisma.rolePermission.upsert({
                    where: {
                        roleId_resource_action: {
                            roleId: item.roleId,
                            resource: item.resource,
                            action: item.action
                        }
                    },
                    update: { isEnabled: item.isEnabled },
                    create: {
                        roleId: item.roleId,
                        resource: item.resource,
                        action: item.action,
                        isEnabled: item.isEnabled
                    }
                })
            );

            await prisma.$transaction(updates);
            return res.json({ message: 'Hak akses berhasil diperbarui' });
        }

        // Handle Single Update
        const { roleId, resource, action, isEnabled } = data;

        if (!roleId || !resource || !action) {
            return res.status(400).json({ error: 'RoleId, resource, dan action harus diisi' });
        }

        const permission = await prisma.rolePermission.upsert({
            where: {
                roleId_resource_action: {
                    roleId,
                    resource,
                    action
                }
            },
            update: {
                isEnabled
            },
            create: {
                roleId,
                resource,
                action,
                isEnabled
            }
        });

        res.json(permission);
    } catch (error) {
        console.error('Error updating permission:', error);
        res.status(500).json({ error: 'Gagal mengupdate hak akses' });
    }
};

// Get default permissions
export const getDefaultPermissions = async (req: Request, res: Response) => {
    try {
        const defaults = await DefaultPermissionService.getAllDefaults();
        res.json(defaults);
    } catch (error) {
        console.error('Error fetching default permissions:', error);
        res.status(500).json({ error: 'Gagal mengambil data default permissions' });
    }
};

// Update default permissions (Batch only for now as UI sends all)
export const updateDefaultPermissions = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Format data harus array' });
        }

        const updates = data.map((item: any) =>
            prisma.defaultRolePermission.upsert({
                where: {
                    roleId_resource_action: {
                        roleId: item.roleId,
                        resource: item.resource,
                        action: item.action
                    }
                },
                update: { isEnabled: item.isEnabled },
                create: {
                    roleId: item.roleId,
                    resource: item.resource,
                    action: item.action,
                    isEnabled: item.isEnabled
                }
            })
        );

        await prisma.$transaction(updates);
        res.json({ message: 'Default hak akses berhasil diperbarui' });
    } catch (error) {
        console.error('Error updating default permissions:', error);
        res.status(500).json({ error: 'Gagal mengupdate default hak akses' });
    }
};

// Reset default permissions to system values
export const resetDefaultPermissions = async (req: Request, res: Response) => {
    try {
        await DefaultPermissionService.initializeFromHardcoded();
        res.json({ message: 'Default hak akses berhasil di-reset ke nilai sistem' });
    } catch (error) {
        console.error('Error resetting default permissions:', error);
        res.status(500).json({ error: 'Gagal me-reset default hak akses' });
    }
};

// Initialize permissions (Helper)
export const initializePermissions = async (req: Request, res: Response) => {
    try {
        // Reuse logic from DefaultPermissionService to populate actual permissions based on defaults
        // 1. Ensure defaults are initialized (if not exist)
        let defaults = await DefaultPermissionService.getAllDefaults();
        if (defaults.length === 0) {
            defaults = await DefaultPermissionService.initializeFromHardcoded();
        }

        // 2. Apply defaults to actual role permissions
        let count = 0;
        for (const defaultPerm of defaults) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_resource_action: {
                        roleId: defaultPerm.roleId,
                        resource: defaultPerm.resource,
                        action: defaultPerm.action
                    }
                },
                update: { isEnabled: defaultPerm.isEnabled },
                create: {
                    roleId: defaultPerm.roleId,
                    resource: defaultPerm.resource,
                    action: defaultPerm.action,
                    isEnabled: defaultPerm.isEnabled
                }
            });
            count++;
        }

        res.json({ message: `Initialized ${count} permissions from default configuration` });
    } catch (error) {
        console.error('Error initializing permissions:', error);
        res.status(500).json({ error: 'Gagal inisialisasi hak akses' });
    }
};
