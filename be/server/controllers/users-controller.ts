import { Request, Response } from 'express';
import { UserService } from '../services/UserService.js';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { role, page = 1, limit = 10, q, sortBy, sortOrder, kelasId, fakultasId, mataKuliahId, semester, prodi, kelas } = req.query;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const result = await UserService.getAllUsers({
            role: role as string,
            page: Number(page),
            limit: Number(limit),
            q: q as string,
            userId,
            userRole,
            kelasId: kelasId as string,
            fakultasId: fakultasId as string,
            mataKuliahId: mataKuliahId as string,
            semester: semester ? Number(semester) : undefined,
            prodi: prodi as string,
            kelas: kelas as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as string
        });

        res.json(result);
    } catch (error: any) {
        console.error('Get users error:', error);

        if (error.message === 'FORBIDDEN_ACCESS_MK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }
        if (error.message === 'MK_NOT_FOUND') {
            return res.status(404).json({ error: 'Mata kuliah tidak ditemukan' });
        }

        res.status(500).json({ error: 'Gagal mengambil data users' });
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await UserService.getUserById(id);
        res.json({ data: user });
    } catch (error: any) {
        console.error('Get user error:', error);
        if (error.message === 'User tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mengambil data user' });
    }
};

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const updatedUser = await UserService.updateUserRole(id, role);

        res.json({
            message: 'Role user berhasil diperbarui',
            data: updatedUser
        });
    } catch (error: any) {
        console.error('Update user role error:', error);
        if (error.message === 'Role tidak valid' || error.message === 'User tidak ditemukan') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal memperbarui role user' });
    }
};

// Update user basic info (admin only)
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const updatedUser = await UserService.updateUser(id, req.body);

        res.json({
            message: 'User berhasil diperbarui',
            data: updatedUser
        });
    } catch (error: any) {
        console.error('Update user error:', error);
        if (error.message === 'Tidak ada data untuk diperbarui' || error.message === 'User tidak ditemukan') {
            return res.status(400).json({ error: error.message });
        }
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        res.status(500).json({ error: 'Gagal memperbarui user' });
    }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await UserService.deleteUser(id);
        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Gagal menghapus user' });
    }
};
