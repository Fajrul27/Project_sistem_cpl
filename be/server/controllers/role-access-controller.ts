
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { DefaultPermissionService } from '../services/DefaultPermissionService.js';

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

// Update permission (Single or Batch)
export const updatePermission = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        // Handle Batch Update
        if (Array.isArray(data)) {
            const updates = data.map((item: any) =>
                prisma.rolePermission.upsert({
                    where: {
                        role_resource_action: {
                            role: item.role,
                            resource: item.resource,
                            action: item.action
                        }
                    },
                    update: { isEnabled: item.isEnabled },
                    create: {
                        role: item.role,
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
        const { role, resource, action, isEnabled } = data;

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
        // Check if custom defaults exist
        const customDefaults = await DefaultPermissionService.getAllDefaults();

        if (customDefaults && customDefaults.length > 0) {
            // Use custom defaults
            let count = 0;
            for (const defaultPerm of customDefaults) {
                await prisma.rolePermission.upsert({
                    where: {
                        role_resource_action: {
                            role: defaultPerm.role as any,
                            resource: defaultPerm.resource,
                            action: defaultPerm.action
                        }
                    },
                    update: { isEnabled: defaultPerm.isEnabled },
                    create: {
                        role: defaultPerm.role as any,
                        resource: defaultPerm.resource,
                        action: defaultPerm.action,
                        isEnabled: defaultPerm.isEnabled
                    }
                });
                count++;
            }
            return res.json({ message: `Initialized ${count} permissions from custom defaults`, source: 'custom' });
        }

        // No custom defaults, use hardcoded system defaults
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
            'evaluasi_cpl',
            'rekap_kuesioner',
            'settings',
            'evaluasi_mk',
            'role_access',
            'default_role_access',
            'fakultas'
        ];

        const actions = ['view', 'create', 'edit', 'delete', 'view_all', 'verify'];
        const roles = ['admin', 'dosen', 'kaprodi', 'mahasiswa'];

        let count = 0;

        // Helper to check if a role should have specific access
        const shouldHaveAccess = (role: string, resource: string, action: string): boolean => {
            // 1. ADMIN: Has access to EVERYTHING
            if (role === 'admin') return true;

            // 2. KAPRODI
            if (role === 'kaprodi') {
                // Full Management Access (CRUD)
                // Added: dosen_pengampu, nilai_teknik
                if (['visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk', 'kaprodi_data', 'mahasiswa', 'evaluasi_cpl', 'analisis_cpl', 'evaluasi_mk', 'dosen_pengampu', 'nilai_teknik'].includes(resource)) {
                    if (resource === 'evaluasi_mk' && action === 'verify') return true; // Kaprodi verifies evaluations
                    if (action === 'view_all') return true;
                    return ['view', 'create', 'edit', 'delete'].includes(action);
                }
                // View Only Access
                if (['dashboard', 'users', 'transkrip_cpl', 'rekap_kuesioner', 'settings', 'fakultas'].includes(resource)) {
                    if (action === 'view_all') return resource === 'rekap_kuesioner' || resource === 'fakultas';
                    return action === 'view';
                }
                // No Access
                return false;
            }

            // 3. DOSEN
            if (role === 'dosen') {
                // Operational Access (Input Nilai, Evaluasi)
                if (['nilai_teknik', 'evaluasi_cpl', 'evaluasi_mk'].includes(resource)) {
                    if (resource === 'evaluasi_mk') return ['view', 'edit', 'create'].includes(action); // Dosen creates/edits evaluation
                    return true;
                }
                // View Only Access
                if (['dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk', 'mahasiswa', 'transkrip_cpl', 'analisis_cpl', 'users', 'fakultas'].includes(resource)) {
                    if (resource === 'fakultas' && action === 'view') return true;
                    return action === 'view';
                }
                // No Access
                return false;
            }

            // 4. MAHASISWA
            if (role === 'mahasiswa') {
                // Input Kuesioner
                if (resource === 'kuesioner') {
                    return ['view', 'create', 'edit'].includes(action);
                }
                // View Only Access (Self Data)
                if (['dashboard', 'visi_misi', 'profil_lulusan', 'transkrip_cpl', 'fakultas'].includes(resource)) {
                    return action === 'view';
                }
                // No Access
                return false;
            }

            return false;
        };

        for (const resource of resources) {
            for (const role of roles) {
                for (const action of actions) {
                    const isEnabled = shouldHaveAccess(role, resource, action);

                    await prisma.rolePermission.upsert({
                        where: {
                            role_resource_action: {
                                role: role as any,
                                resource,
                                action
                            }
                        },
                        update: { isEnabled }, // Force update to reset to defaults
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

        res.json({ message: `Initialized ${count} permissions with standard defaults` });
    } catch (error) {
        console.error('Error initializing permissions:', error);
        res.status(500).json({ error: 'Gagal inisialisasi hak akses' });
    }
};
