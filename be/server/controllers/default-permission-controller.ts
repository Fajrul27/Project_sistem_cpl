import { Request, Response } from 'express';
import { DefaultPermissionService } from '../services/DefaultPermissionService.js';
import { Role } from '@prisma/client';

export class DefaultPermissionController {
    // GET /api/default-permissions - Get all defaults
    static async getAllDefaults(req: Request, res: Response) {
        try {
            const defaults = await DefaultPermissionService.getAllDefaults();
            res.json(defaults);
        } catch (error) {
            console.error('Error getting defaults:', error);
            res.status(500).json({ error: 'Failed to get default permissions' });
        }
    }

    // GET /api/default-permissions/:role - Get defaults for a role
    static async getDefaultsByRole(req: Request, res: Response) {
        try {
            const role = req.params.role as Role;
            const defaults = await DefaultPermissionService.getDefaultsByRole(role);
            res.json(defaults);
        } catch (error) {
            console.error('Error getting defaults for role:', error);
            res.status(500).json({ error: 'Failed to get default permissions for role' });
        }
    }

    // POST /api/default-permissions/initialize - Initialize from hardcoded
    static async initialize(req: Request, res: Response) {
        try {
            const defaults = await DefaultPermissionService.initializeFromHardcoded();
            res.json({ message: 'Default permissions initialized', defaults });
        } catch (error) {
            console.error('Error initializing defaults:', error);
            res.status(500).json({ error: 'Failed to initialize default permissions' });
        }
    }

    // PUT /api/default-permissions/:role - Update defaults for a role
    static async updateRoleDefaults(req: Request, res: Response) {
        try {
            const role = req.params.role as Role;
            const { permissions } = req.body;

            if (!permissions || !Array.isArray(permissions)) {
                return res.status(400).json({ error: 'Invalid permissions data' });
            }

            const updated = await DefaultPermissionService.updateRoleDefaults(role, permissions);
            res.json({ message: 'Default permissions updated', defaults: updated });
        } catch (error) {
            console.error('Error updating defaults:', error);
            res.status(500).json({ error: 'Failed to update default permissions' });
        }
    }

    // GET /api/default-permissions/export - Export as JSON
    static async exportDefaults(req: Request, res: Response) {
        try {
            const exportData = await DefaultPermissionService.exportDefaults();
            res.json(exportData);
        } catch (error) {
            console.error('Error exporting defaults:', error);
            res.status(500).json({ error: 'Failed to export default permissions' });
        }
    }

    // POST /api/default-permissions/import - Import from JSON
    static async importDefaults(req: Request, res: Response) {
        try {
            const data = req.body;
            const imported = await DefaultPermissionService.importDefaults(data);
            res.json({ message: 'Default permissions imported', defaults: imported });
        } catch (error) {
            console.error('Error importing defaults:', error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to import default permissions' });
        }
    }
}
