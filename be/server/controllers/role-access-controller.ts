
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// Get all permissions
export const getPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await prisma.rolePermission.findMany({
            orderBy: [
                { resource: 'asc' },
                { role: 'asc' },
                { action: 'asc' }
            ]
        });
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Gagal mengambil data hak akses' });
    }
};

// Update permission
export const updatePermission = async (req: Request, res: Response) => {
    try {
        const { role, resource, action, isEnabled } = req.body;

        if (!role || !resource || !action) {
            return res.status(400).json({ error: 'Role, resource, dan action harus diisi' });
        }

        const permission = await prisma.rolePermission.upsert({
            where: {
                role_resource_action: {
                    role,
                    resource,
                    action
                }
            },
            update: {
                isEnabled
            },
            create: {
                role,
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

// Initialize default permissions (Helper)
export const initializePermissions = async (req: Request, res: Response) => {
    try {
        // Define default resources and actions
        const resources = [
            'dashboard',
            'visi_misi',
            'profil_lulusan',
            'cpl',
            'mata_kuliah',
            'cpmk',
            'nilai_teknik',
            'kuesioner',
            'dosen_pengampu',
            'kaprodi_data',
            'mahasiswa',
            'users',
            'transkrip_cpl',
            'analisis_cpl',
            'rekap_kuesioner',
            'settings'
        ];

        const actions = ['view', 'create', 'edit', 'delete'];
        const roles = ['admin', 'dosen', 'kaprodi', 'mahasiswa'];

        let count = 0;

        for (const resource of resources) {
            for (const role of roles) {
                for (const action of actions) {
                    // Default logic (simplified)
                    let isEnabled = false;

                    if (role === 'admin') isEnabled = true;
                    else if (action === 'view') isEnabled = true; // Default view for all (refine later)

                    // Specific overrides based on current system logic
                    if (role === 'mahasiswa') {
                        if (['users', 'dosen_pengampu', 'kaprodi_data', 'nilai_teknik', 'rekap_kuesioner', 'settings'].includes(resource)) {
                            isEnabled = false;
                        }
                        if (resource === 'kuesioner' && action === 'create') isEnabled = true;
                        if (action !== 'view' && resource !== 'kuesioner') isEnabled = false;
                    }

                    await prisma.rolePermission.upsert({
                        where: {
                            role_resource_action: {
                                role: role as any,
                                resource,
                                action
                            }
                        },
                        update: {}, // Don't overwrite if exists
                        create: {
                            role: role as any,
                            resource,
                            action,
                            isEnabled
                        }
                    });
                    count++;
                }
            }
        }

        res.json({ message: `Initialized ${count} permissions` });
    } catch (error) {
        console.error('Error initializing permissions:', error);
        res.status(500).json({ error: 'Gagal inisialisasi hak akses' });
    }
};
