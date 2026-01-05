import { Request, Response } from 'express';
import { RoleService } from '../services/RoleService.js';

// Get all roles
export const getAllRoles = async (req: Request, res: Response) => {
    try {
        const { includeInactive } = req.query;
        const roles = await RoleService.getAllRoles(includeInactive === 'true');
        res.json({ data: roles });
    } catch (error) {
        console.error('Error getting roles:', error);
        res.status(500).json({ error: 'Gagal mengambil data role' });
    }
};

// Get role by ID
export const getRoleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const role = await RoleService.getRoleById(id);

        if (!role) {
            return res.status(404).json({ error: 'Role tidak ditemukan' });
        }

        res.json({ data: role });
    } catch (error) {
        console.error('Error getting role:', error);
        res.status(500).json({ error: 'Gagal mengambil data role' });
    }
};

// Create new role
export const createRole = async (req: Request, res: Response) => {
    try {
        const { name, displayName, description, icon, color, sortOrder } = req.body;

        if (!name || !displayName) {
            return res.status(400).json({ error: 'Name and displayName are required' });
        }

        const role = await RoleService.createRole({
            name,
            displayName,
            description,
            icon,
            color,
            sortOrder
        });

        res.status(201).json({ data: role, message: 'Role berhasil dibuat' });
    } catch (error: any) {
        console.error('Error creating role:', error);
        if (error.message.includes('already exists')) {
            return res.status(409).json({ error: error.message });
        }
        if (error.message.includes('must be lowercase')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal membuat role' });
    }
};

// Update role
export const updateRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { displayName, description, icon, color, sortOrder } = req.body;

        const updated = await RoleService.updateRole(id, {
            displayName,
            description,
            icon,
            color,
            sortOrder
        });

        res.json({ data: updated, message: 'Role berhasil diupdate' });
    } catch (error: any) {
        console.error('Error updating role:', error);
        if (error.message === 'Role not found') {
            return res.status(404).json({ error: 'Role tidak ditemukan' });
        }
        if (error.message.includes('system role')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mengupdate role' });
    }
};

// Delete role
export const deleteRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await RoleService.deleteRole(id);

        res.json({ message: 'Role berhasil dihapus' });
    } catch (error: any) {
        console.error('Error deleting role:', error);
        if (error.message === 'Role not found') {
            return res.status(404).json({ error: 'Role tidak ditemukan' });
        }
        if (error.message.includes('system role')) {
            return res.status(403).json({ error: error.message });
        }
        if (error.message.includes('user(s) still have')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal menghapus role' });
    }
};

// Toggle role status
export const toggleRoleStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const updated = await RoleService.toggleRoleStatus(id);

        res.json({
            data: updated,
            message: `Role ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}`
        });
    } catch (error: any) {
        console.error('Error toggling role status:', error);
        if (error.message === 'Role not found') {
            return res.status(404).json({ error: 'Role tidak ditemukan' });
        }
        if (error.message.includes('system role')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mengubah status role' });
    }
};

// Initialize system roles
export const initializeSystemRoles = async (req: Request, res: Response) => {
    try {
        await RoleService.initializeSystemRoles();
        res.json({ message: 'System roles berhasil diinisialisasi' });
    } catch (error) {
        console.error('Error initializing system roles:', error);
        res.status(500).json({ error: 'Gagal menginisialisasi system roles' });
    }
};
