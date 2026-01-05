import { prisma } from '../lib/prisma.js';
import { DefaultPermissionService } from './DefaultPermissionService.js';

interface RoleInput {
    name: string;
    displayName: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
}

export class RoleService {
    // Get all roles
    static async getAllRoles(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        return prisma.role.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: {
                        userRoles: true,
                        rolePermissions: true
                    }
                }
            }
        });
    }

    // Get role by ID
    static async getRoleById(id: string) {
        return prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { userRoles: true, rolePermissions: true }
                }
            }
        });
    }

    // Get role by name
    static async getRoleByName(name: string) {
        return prisma.role.findUnique({
            where: { name }
        });
    }

    // Create new role
    static async createRole(data: RoleInput) {
        // Validate name format (lowercase, alphanumeric + underscore only)
        if (!/^[a-z0-9_]+$/.test(data.name)) {
            throw new Error('Role name must be lowercase alphanumeric with underscores only');
        }

        // Check if name already exists
        const existing = await prisma.role.findUnique({
            where: { name: data.name }
        });

        if (existing) {
            throw new Error('Role with this name already exists');
        }

        const role = await prisma.role.create({
            data: {
                name: data.name,
                displayName: data.displayName,
                description: data.description,
                icon: data.icon,
                color: data.color,
                sortOrder: data.sortOrder || 999,
                isSystem: false  // Custom roles are never system roles
            }
        });

        // Auto-initialize default permissions for new role (all disabled)
        await DefaultPermissionService.initializePermissionsForNewRole(role.id);

        return role;
    }

    // Update role
    static async updateRole(id: string, data: Partial<RoleInput>) {
        const existing = await prisma.role.findUnique({ where: { id } });

        if (!existing) {
            throw new Error('Role not found');
        }

        // Cannot change name of system roles
        if (existing.isSystem && data.name && data.name !== existing.name) {
            throw new Error('Cannot change name of system role');
        }

        return prisma.role.update({
            where: { id },
            data: {
                displayName: data.displayName,
                description: data.description,
                icon: data.icon,
                color: data.color,
                sortOrder: data.sortOrder
            }
        });
    }

    // Delete role
    static async deleteRole(id: string) {
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { userRoles: true }
                }
            }
        });

        if (!role) {
            throw new Error('Role not found');
        }

        // Cannot delete system roles
        if (role.isSystem) {
            throw new Error('Cannot delete system role');
        }

        // Cannot delete if users exist with this role
        if (role._count.userRoles > 0) {
            throw new Error(`Cannot delete role: ${role._count.userRoles} user(s) still have this role`);
        }

        // Delete related permissions first (cascade should handle this, but explicit is safer)
        await prisma.rolePermission.deleteMany({
            where: { roleId: id }
        });

        await prisma.defaultRolePermission.deleteMany({
            where: { roleId: id }
        });

        // Delete the role
        return prisma.role.delete({
            where: { id }
        });
    }

    // Toggle role active status
    static async toggleRoleStatus(id: string) {
        const role = await prisma.role.findUnique({ where: { id } });

        if (!role) {
            throw new Error('Role not found');
        }

        // Cannot deactivate system roles
        if (role.isSystem && role.isActive) {
            throw new Error('Cannot deactivate system role');
        }

        return prisma.role.update({
            where: { id },
            data: { isActive: !role.isActive }
        });
    }

    // Initialize system roles (migration helper)
    static async initializeSystemRoles() {
        const systemRoles = [
            {
                name: 'admin',
                displayName: 'Administrator',
                description: 'Full system access',
                icon: 'Shield',
                color: '#EF4444',
                sortOrder: 1,
                isSystem: true
            },
            {
                name: 'kaprodi',
                displayName: 'Kepala Program Studi',
                description: 'Program coordinator',
                icon: 'GraduationCap',
                color: '#3B82F6',
                sortOrder: 2,
                isSystem: true
            },
            {
                name: 'dosen',
                displayName: 'Dosen',
                description: 'Lecturer',
                icon: 'BookOpen',
                color: '#10B981',
                sortOrder: 3,
                isSystem: true
            },
            {
                name: 'mahasiswa',
                displayName: 'Mahasiswa',
                description: 'Student',
                icon: 'User',
                color: '#8B5CF6',
                sortOrder: 4,
                isSystem: true
            },
            {
                name: 'dekan',
                displayName: 'Dekan',
                description: 'Dean',
                icon: 'Crown',
                color: '#F59E0B',
                sortOrder: 5,
                isSystem: true
            }
        ];

        for (const roleData of systemRoles) {
            await prisma.role.upsert({
                where: { name: roleData.name },
                update: {
                    isSystem: true // Force system status if name matches
                },
                create: roleData
            });
        }
    }
}
