// ============================================
// CPMK Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all CPMK (with optional mata kuliah filter)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { mataKuliahId } = req.query;

        const where: any = { isActive: true };
        if (mataKuliahId) {
            where.mataKuliahId = mataKuliahId as string;
        }

        const cpmk = await prisma.cpmk.findMany({
            where,
            include: {
                mataKuliah: {
                    select: {
                        id: true,
                        kodeMk: true,
                        namaMk: true,
                        semester: true
                    }
                },
                cplMappings: {
                    include: {
                        cpl: {
                            select: {
                                id: true,
                                kodeCpl: true,
                                deskripsi: true
                            }
                        }
                    }
                },
                teknikPenilaian: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ data: cpmk });
    } catch (error) {
        console.error('Get CPMK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data CPMK' });
    }
});

// Get CPMK by Mata Kuliah ID
router.get('/mata-kuliah/:mkId', authMiddleware, async (req, res) => {
    try {
        const { mkId } = req.params;

        const cpmk = await prisma.cpmk.findMany({
            where: {
                mataKuliahId: mkId,
                isActive: true
            },
            include: {
                mataKuliah: {
                    select: {
                        id: true,
                        kodeMk: true,
                        namaMk: true
                    }
                },
                cplMappings: {
                    include: {
                        cpl: {
                            select: {
                                id: true,
                                kodeCpl: true,
                                deskripsi: true
                            }
                        }
                    }
                },
                teknikPenilaian: true
            },
            orderBy: { kodeCpmk: 'asc' }
        });

        res.json({ data: cpmk });
    } catch (error) {
        console.error('Get CPMK by MK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data CPMK' });
    }
});

// Get CPMK by ID (with full details)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const cpmk = await prisma.cpmk.findUnique({
            where: { id },
            include: {
                mataKuliah: {
                    select: {
                        id: true,
                        kodeMk: true,
                        namaMk: true,
                        semester: true
                    }
                },
                cplMappings: {
                    include: {
                        cpl: {
                            select: {
                                id: true,
                                kodeCpl: true,
                                deskripsi: true,
                                kategori: true
                            }
                        }
                    }
                },
                teknikPenilaian: {
                    orderBy: { createdAt: 'asc' }
                },
                creator: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: {
                                namaLengkap: true
                            }
                        }
                    }
                }
            }
        });

        if (!cpmk) {
            return res.status(404).json({ error: 'CPMK tidak ditemukan' });
        }

        res.json({ data: cpmk });
    } catch (error) {
        console.error('Get CPMK by ID error:', error);
        res.status(500).json({ error: 'Gagal mengambil data CPMK' });
    }
});

// Create CPMK
router.post('/', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { kodeCpmk, deskripsi, mataKuliahId } = req.body;

        // Validate required fields
        if (!kodeCpmk || !mataKuliahId) {
            return res.status(400).json({ error: 'Kode CPMK dan Mata Kuliah harus diisi' });
        }

        // Check if mata kuliah exists
        const mataKuliah = await prisma.mataKuliah.findUnique({
            where: { id: mataKuliahId }
        });

        if (!mataKuliah) {
            return res.status(404).json({ error: 'Mata Kuliah tidak ditemukan' });
        }

        const cpmk = await prisma.cpmk.create({
            data: {
                kodeCpmk: kodeCpmk.trim(),
                deskripsi: deskripsi?.trim() || null,
                mataKuliahId,
                createdBy: userId
            },
            include: {
                mataKuliah: {
                    select: {
                        id: true,
                        kodeMk: true,
                        namaMk: true
                    }
                }
            }
        });

        res.status(201).json({ data: cpmk, message: 'CPMK berhasil dibuat' });
    } catch (error) {
        console.error('Create CPMK error:', error);
        res.status(500).json({ error: 'Gagal membuat CPMK' });
    }
});

// Update CPMK
router.put('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { kodeCpmk, deskripsi } = req.body;

        // Check if CPMK exists
        const existing = await prisma.cpmk.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({ error: 'CPMK tidak ditemukan' });
        }

        const cpmk = await prisma.cpmk.update({
            where: { id },
            data: {
                kodeCpmk: kodeCpmk?.trim() || existing.kodeCpmk,
                deskripsi: deskripsi?.trim() || existing.deskripsi
            },
            include: {
                mataKuliah: {
                    select: {
                        id: true,
                        kodeMk: true,
                        namaMk: true
                    }
                }
            }
        });

        res.json({ data: cpmk, message: 'CPMK berhasil diupdate' });
    } catch (error) {
        console.error('Update CPMK error:', error);
        res.status(500).json({ error: 'Gagal mengupdate CPMK' });
    }
});

// Delete CPMK (soft delete)
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if CPMK exists
        const existing = await prisma.cpmk.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({ error: 'CPMK tidak ditemukan' });
        }

        await prisma.cpmk.update({
            where: { id },
            data: { isActive: false }
        });

        res.json({ message: 'CPMK berhasil dihapus' });
    } catch (error) {
        console.error('Delete CPMK error:', error);
        res.status(500).json({ error: 'Gagal menghapus CPMK' });
    }
});

// Validate CPMK (Kaprodi only)
router.put('/:id/validate', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const { statusValidasi } = req.body;

        // Validate status
        const validStatuses = ['draft', 'validated', 'active'];
        if (!validStatuses.includes(statusValidasi)) {
            return res.status(400).json({
                error: 'Status validasi tidak valid. Pilih: draft, validated, atau active'
            });
        }

        // Check if CPMK exists
        const existing = await prisma.cpmk.findUnique({
            where: { id },
            include: { mataKuliah: true }
        });

        if (!existing) {
            return res.status(404).json({ error: 'CPMK tidak ditemukan' });
        }

        const cpmk = await prisma.cpmk.update({
            where: { id },
            data: {
                statusValidasi,
                validatedAt: statusValidasi === 'validated' || statusValidasi === 'active'
                    ? new Date()
                    : null,
                validatedBy: statusValidasi === 'validated' || statusValidasi === 'active'
                    ? userId
                    : null
            },
            include: {
                mataKuliah: {
                    select: {
                        id: true,
                        kodeMk: true,
                        namaMk: true
                    }
                },
                cplMappings: {
                    include: { cpl: true }
                },
                teknikPenilaian: true
            }
        });

        res.json({
            data: cpmk,
            message: `CPMK berhasil diubah statusnya menjadi ${statusValidasi}`
        });
    } catch (error) {
        console.error('Validate CPMK error:', error);
        res.status(500).json({ error: 'Gagal memvalidasi CPMK' });
    }
});

export default router;
