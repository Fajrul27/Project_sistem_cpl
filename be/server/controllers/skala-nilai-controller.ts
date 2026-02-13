import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export class SkalaNilaiController {

    // Get all grade scales
    static async getAll(req: Request, res: Response) {
        try {
            const data = await prisma.skalaNilai.findMany({
                orderBy: { nilaiMin: 'desc' }
            });
            return res.json(data);
        } catch (error) {
            console.error('Get Skala Nilai Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Create new grade scale
    static async create(req: Request, res: Response) {
        try {
            const { huruf, nilaiMin, nilaiMax, isLulus } = req.body;

            // Basic validation
            if (!huruf || nilaiMin === undefined || nilaiMax === undefined) {
                return res.status(400).json({ error: 'Semua field harus diisi' });
            }

            const data = await prisma.skalaNilai.create({
                data: {
                    huruf,
                    nilaiMin,
                    nilaiMax,
                    isLulus: isLulus !== undefined ? isLulus : true,
                    isSystem: false,
                    isActive: true
                }
            });
            return res.status(201).json(data);
        } catch (error) {
            console.error('Create Skala Nilai Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Update grade scale
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { huruf, nilaiMin, nilaiMax, isActive, isLulus } = req.body;

            const existing = await prisma.skalaNilai.findUnique({ where: { id } });
            if (!existing) return res.status(404).json({ error: 'Data not found' });

            // If system default, prevent changing the letter (identity)
            if (existing.isSystem && huruf !== existing.huruf) {
                return res.status(403).json({ error: 'Cannot change letter grade of system default data' });
            }

            const data = await prisma.skalaNilai.update({
                where: { id },
                data: {
                    huruf,
                    nilaiMin,
                    nilaiMax,
                    isActive,
                    isLulus
                }
            });
            return res.json(data);
        } catch (error) {
            console.error('Update Skala Nilai Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Delete grade scale
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const existing = await prisma.skalaNilai.findUnique({ where: { id } });

            if (!existing) {
                return res.status(404).json({ error: 'Data not found' });
            }

            if (existing.isSystem) {
                return res.status(403).json({ error: 'Cannot delete system default data' });
            }

            await prisma.skalaNilai.delete({
                where: { id }
            });
            return res.json({ message: 'Deleted successfully' });
        } catch (error) {
            console.error('Delete Skala Nilai Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
