import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware as requireAuth, requireRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Schema validation
const profilLulusanSchema = z.object({
    kode: z.string().min(1, "Kode wajib diisi"),
    nama: z.string().min(1, "Nama wajib diisi"),
    deskripsi: z.string().optional(),
    prodiId: z.string().uuid("Prodi ID tidak valid"),
    isActive: z.boolean().optional(),
    cplIds: z.array(z.string()).optional() // Add cplIds support
});

// GET /api/profil-lulusan?prodiId=...
router.get('/', requireAuth, async (req, res) => {
    try {
        const { prodiId } = req.query;

        const whereClause: any = { isActive: true };
        if (prodiId) {
            whereClause.prodiId = String(prodiId);
        }

        const data = await prisma.profilLulusan.findMany({
            where: whereClause,
            orderBy: { kode: 'asc' },
            include: {
                prodi: {
                    select: { nama: true }
                },
                cplMappings: {
                    include: {
                        cpl: true
                    }
                }
            }
        });

        res.json({ data });
    } catch (error) {
        console.error('Error fetching Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal mengambil data Profil Lulusan' });
    }
});

// POST /api/profil-lulusan
router.post('/', requireAuth, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const body = profilLulusanSchema.parse(req.body);

        // Check duplicate kode in same prodi
        const existing = await prisma.profilLulusan.findFirst({
            where: {
                prodiId: body.prodiId,
                kode: body.kode
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Kode Profil Lulusan sudah ada di prodi ini' });
        }

        // Use transaction to create profile and mappings
        const newItem = await prisma.$transaction(async (tx) => {
            const profil = await tx.profilLulusan.create({
                data: {
                    kode: body.kode,
                    nama: body.nama,
                    deskripsi: body.deskripsi,
                    prodiId: body.prodiId,
                    isActive: body.isActive ?? true
                }
            });

            if (body.cplIds && body.cplIds.length > 0) {
                await tx.profilLulusanCpl.createMany({
                    data: body.cplIds.map((cplId: string) => ({
                        profilLulusanId: profil.id,
                        cplId
                    }))
                });
            }

            return profil;
        });

        res.status(201).json(newItem);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Error creating Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal menyimpan Profil Lulusan' });
    }
});

// PUT /api/profil-lulusan/:id
router.put('/:id', requireAuth, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const { id } = req.params;
        const body = profilLulusanSchema.partial().parse(req.body);

        // Check duplicate kode if changing
        if (body.kode && body.prodiId) {
            const existing = await prisma.profilLulusan.findFirst({
                where: {
                    prodiId: body.prodiId,
                    kode: body.kode,
                    NOT: { id }
                }
            });
            if (existing) {
                return res.status(400).json({ error: 'Kode Profil Lulusan sudah digunakan' });
            }
        }

        // Use transaction to update profile and mappings
        const updatedItem = await prisma.$transaction(async (tx) => {
            const profil = await tx.profilLulusan.update({
                where: { id },
                data: {
                    kode: body.kode,
                    nama: body.nama,
                    deskripsi: body.deskripsi,
                    prodiId: body.prodiId,
                    isActive: body.isActive
                }
            });

            if (body.cplIds) {
                // Delete existing mappings
                await tx.profilLulusanCpl.deleteMany({
                    where: { profilLulusanId: id }
                });

                // Create new mappings
                if (body.cplIds.length > 0) {
                    await tx.profilLulusanCpl.createMany({
                        data: body.cplIds.map((cplId: string) => ({
                            profilLulusanId: id,
                            cplId
                        }))
                    });
                }
            }

            return profil;
        });

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal mengupdate Profil Lulusan' });
    }
});

// DELETE /api/profil-lulusan/:id
router.delete('/:id', requireAuth, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.profilLulusan.delete({ where: { id } });
        res.json({ message: 'Berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal menghapus Profil Lulusan' });
    }
});

export default router;
