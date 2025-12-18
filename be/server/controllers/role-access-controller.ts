
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
        // Define default resources
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
            'settings'
        ];

        const actions = ['view', 'create', 'edit', 'delete'];
        const roles = ['admin', 'dosen', 'kaprodi', 'mahasiswa'];

        let count = 0;

        // Helper to check if a role should have specific access
        const shouldHaveAccess = (role: string, resource: string, action: string): boolean => {
            // 1. ADMIN: Has access to EVERYTHING
            if (role === 'admin') return true;

            // 2. KAPRODI
            if (role === 'kaprodi') {
                // Full Management Access
                if (['visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk', 'kaprodi_data', 'mahasiswa', 'evaluasi_cpl', 'analisis_cpl'].includes(resource)) {
                    return true;
                }
                // View Only Access
                if (['dashboard', 'dosen_pengampu', 'users', 'transkrip_cpl', 'rekap_kuesioner', 'settings'].includes(resource)) {
                    return action === 'view';
                }
                // No Access
                return false;
            }

            // 3. DOSEN
            if (role === 'dosen') {
                // Operational Access (Input Nilai, Evaluasi)
                if (['nilai_teknik', 'evaluasi_cpl'].includes(resource)) {
                    return true;
                }
                // View Only Access (Standardization: CPMK must be view only)
                if (['dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'mata_kuliah', 'cpmk', 'mahasiswa', 'transkrip_cpl', 'analisis_cpl'].includes(resource)) {
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
                if (['dashboard', 'visi_misi', 'profil_lulusan', 'cpl', 'transkrip_cpl'].includes(resource)) {
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
