import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getAllAngkatan = async (req: Request, res: Response) => {
    try {
        const angkatan = await prisma.angkatan.findMany({
            orderBy: { tahun: 'desc' },
            include: {
                kurikulum: true
            }
        });
        res.json({ data: angkatan });
    } catch (error) {
        console.error('Get angkatan error:', error);
        res.status(500).json({ error: 'Gagal mengambil data angkatan' });
    }
};

export const createAngkatan = async (req: Request, res: Response) => {
    try {
        const { tahun, isActive, kurikulumId } = req.body;

        if (!tahun) {
            return res.status(400).json({ error: 'Tahun angkatan wajib diisi' });
        }

        const existing = await prisma.angkatan.findUnique({
            where: { tahun: parseInt(tahun) }
        });

        if (existing) {
            return res.status(400).json({ error: 'Angkatan dengan tahun ini sudah ada' });
        }

        const angkatan = await prisma.angkatan.create({
            data: {
                tahun: parseInt(tahun),
                isActive: isActive ?? true,
                kurikulumId: kurikulumId || null
            }
        });

        res.status(201).json({ data: angkatan });
    } catch (error) {
        console.error('Create angkatan error:', error);
        res.status(500).json({ error: 'Gagal membuat angkatan' });
    }
};

export const updateAngkatan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { tahun, isActive, kurikulumId } = req.body;

        const angkatan = await prisma.angkatan.update({
            where: { id },
            data: {
                tahun: tahun ? parseInt(tahun) : undefined,
                isActive,
                kurikulumId: kurikulumId || null
            }
        });

        res.json({ data: angkatan });
    } catch (error) {
        console.error('Update angkatan error:', error);
        res.status(500).json({ error: 'Gagal mengupdate angkatan' });
    }
};

export const deleteAngkatan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.angkatan.delete({
            where: { id }
        });

        res.json({ message: 'Angkatan berhasil dihapus' });
    } catch (error) {
        console.error('Delete angkatan error:', error);
        res.status(500).json({ error: 'Gagal menghapus angkatan' });
    }
};
