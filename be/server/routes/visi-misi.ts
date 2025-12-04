import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Schema validation
const visiMisiSchema = z.object({
    teks: z.string().min(1, "Teks wajib diisi"),
    tipe: z.enum(["visi", "misi"]),
    urutan: z.number().int().default(1),
    prodiId: z.string().uuid("Prodi ID tidak valid"),
    isActive: z.boolean().optional()
});

// GET /api/visi-misi?prodiId=...
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { prodiId } = req.query;

        // If user is kaprodi, enforce their prodi
        // But for now, let's trust the query param or fallback to user's prodi if we implemented that logic
        // Ideally: if (req.user.role === 'kaprodi') prodiId = req.user.profile.prodiId;

        const whereClause: any = { isActive: true };
        if (prodiId) {
            whereClause.prodiId = String(prodiId);
        }

        const data = await prisma.visiMisi.findMany({
            where: whereClause,
            orderBy: [
                { tipe: 'desc' }, // Visi first (alphabetically V > M, wait.. Visi vs Misi. Visi should be first. V > M is true. So desc is correct? Visi > Misi)
                { urutan: 'asc' }
            ],
            include: {
                prodi: {
                    select: { nama: true }
                }
            }
        });

        res.json({ data });
    } catch (error) {
        console.error('Error fetching Visi Misi:', error);
        res.status(500).json({ error: 'Gagal mengambil data Visi Misi' });
    }
});

// POST /api/visi-misi
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const body = visiMisiSchema.parse(req.body);

        const newItem = await prisma.visiMisi.create({
            data: {
                teks: body.teks,
                tipe: body.tipe,
                urutan: body.urutan,
                prodiId: body.prodiId,
                isActive: body.isActive ?? true
            }
        });

        res.status(201).json(newItem);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Error creating Visi Misi:', error);
        res.status(500).json({ error: 'Gagal menyimpan Visi Misi' });
    }
});

// PUT /api/visi-misi/:id
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const { id } = req.params;
        const body = visiMisiSchema.partial().parse(req.body);

        const updatedItem = await prisma.visiMisi.update({
            where: { id },
            data: body
        });

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating Visi Misi:', error);
        res.status(500).json({ error: 'Gagal mengupdate Visi Misi' });
    }
});

// DELETE /api/visi-misi/:id
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.visiMisi.delete({ where: { id } });
        res.json({ message: 'Berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting Visi Misi:', error);
        res.status(500).json({ error: 'Gagal menghapus Visi Misi' });
    }
});

export default router;
