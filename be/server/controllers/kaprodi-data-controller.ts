
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// Get kaprodi data by program studi
export const getKaprodiByProgramStudi = async (req: Request, res: Response) => {
    try {
        const { programStudi } = req.params;

        const kaprodiData = await prisma.kaprodiData.findFirst({
            where: {
                OR: [
                    { programStudi: programStudi.toUpperCase() },
                    { prodi: { nama: programStudi } }
                ]
            },
            include: { prodi: true }
        });

        if (!kaprodiData) {
            return res.json({
                data: {
                    programStudi: programStudi.toUpperCase(),
                    namaKaprodi: '( ........................................................ )',
                    nidnKaprodi: ''
                }
            });
        }

        res.json({ data: kaprodiData });
    } catch (error) {
        console.error('Error fetching kaprodi data:', error);
        res.status(500).json({ error: 'Failed to fetch kaprodi data' });
    }
};

// Get all kaprodi data (Admin only)
export const getAllKaprodiData = async (req: Request, res: Response) => {
    try {
        const kaprodiData = await prisma.kaprodiData.findMany({
            orderBy: { programStudi: 'asc' },
            include: { prodi: true }
        });

        res.json({ data: kaprodiData });
    } catch (error) {
        console.error('Error fetching kaprodi data:', error);
        res.status(500).json({ error: 'Failed to fetch kaprodi data' });
    }
};

// Create or update kaprodi data (Admin only)
export const createOrUpdateKaprodiData = async (req: Request, res: Response) => {
    try {
        const { programStudi, namaKaprodi, nidnKaprodi, prodiId } = req.body;

        let targetProdiId = prodiId;
        if (!targetProdiId && programStudi) {
            const prodi = await prisma.prodi.findFirst({ where: { nama: programStudi } });
            targetProdiId = prodi?.id;
        }

        const kaprodiData = await prisma.kaprodiData.upsert({
            where: { programStudi: programStudi.toUpperCase() },
            create: {
                programStudi: programStudi.toUpperCase(),
                prodiId: targetProdiId,
                namaKaprodi,
                nidnKaprodi
            },
            update: {
                namaKaprodi,
                nidnKaprodi,
                prodiId: targetProdiId
            }
        });

        res.json({
            data: kaprodiData,
            message: 'Data Kaprodi berhasil disimpan'
        });
    } catch (error) {
        console.error('Error saving kaprodi data:', error);
        res.status(500).json({ error: 'Failed to save kaprodi data' });
    }
};

// Delete kaprodi data (Admin only)
export const deleteKaprodiData = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.kaprodiData.delete({
            where: { id }
        });

        res.json({ message: 'Data Kaprodi berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting kaprodi data:', error);
        res.status(500).json({ error: 'Failed to delete kaprodi data' });
    }
};
