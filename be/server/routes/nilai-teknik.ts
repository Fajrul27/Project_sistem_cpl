// ============================================
// Nilai Teknik Penilaian Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole, requirePengampu } from '../middleware/auth.js';
import { calculateNilaiCpmk, calculateNilaiCplFromCpmk } from '../lib/calculation.js';

const router = Router();

// Get all nilai teknik by mahasiswa
router.get('/mahasiswa/:mahasiswaId', authMiddleware, async (req, res) => {
    try {
        const { mahasiswaId } = req.params;
        const { semester, tahunAjaran } = req.query;

        const where: any = { mahasiswaId };
        if (semester) where.semester = parseInt(semester as string);
        if (tahunAjaran) where.tahunAjaran = tahunAjaran;

        const nilaiTeknik = await prisma.nilaiTeknikPenilaian.findMany({
            where,
            include: {
                teknikPenilaian: {
                    include: {
                        cpmk: {
                            include: {
                                mataKuliah: true
                            }
                        }
                    }
                },
                mataKuliah: true
            },
            orderBy: [
                { semester: 'asc' },
                { tahunAjaran: 'asc' }
            ]
        });

        res.json({ data: nilaiTeknik });
    } catch (error) {
        console.error('Get nilai teknik error:', error);
        res.status(500).json({ error: 'Gagal mengambil data nilai teknik penilaian' });
    }
});

// Get nilai teknik for specific CPMK
router.get('/cpmk/:cpmkId/:mahasiswaId', authMiddleware, async (req, res) => {
    try {
        const { cpmkId, mahasiswaId } = req.params;
        const { semester, tahunAjaran } = req.query;

        // Get teknik penilaian for this CPMK
        const teknikList = await prisma.teknikPenilaian.findMany({
            where: { cpmkId },
            orderBy: { createdAt: 'asc' }
        });

        // Get nilai for each teknik
        const nilaiTeknik = await Promise.all(
            teknikList.map(async (teknik) => {
                const where: any = {
                    mahasiswaId,
                    teknikPenilaianId: teknik.id
                };
                if (semester) where.semester = parseInt(semester as string);
                if (tahunAjaran) where.tahunAjaran = tahunAjaran;

                const nilai = await prisma.nilaiTeknikPenilaian.findFirst({ where });

                return {
                    teknikPenilaian: teknik,
                    nilai: nilai || null
                };
            })
        );

        res.json({ data: nilaiTeknik });
    } catch (error) {
        console.error('Get nilai teknik by CPMK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data' });
    }
});

// Get all nilai teknik for specific Mata Kuliah (Bulk fetch for Input Grid)
router.get('/mata-kuliah/:mataKuliahId', authMiddleware, requirePengampu('mataKuliahId'), async (req, res) => {
    try {
        const { mataKuliahId } = req.params;
        const { semester, tahunAjaran } = req.query;

        const where: any = { mataKuliahId };
        if (semester) where.semester = parseInt(semester as string);
        if (tahunAjaran) where.tahunAjaran = tahunAjaran;

        const nilaiTeknik = await prisma.nilaiTeknikPenilaian.findMany({
            where,
            select: {
                mahasiswaId: true,
                teknikPenilaianId: true,
                nilai: true
            }
        });

        res.json({ data: nilaiTeknik });
    } catch (error) {
        console.error('Get nilai teknik by MK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data nilai' });
    }
});

// Create/Update nilai teknik penilaian (single)
router.post('/', authMiddleware, requireRole('admin', 'dosen'), requirePengampu('mataKuliahId'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { mahasiswaId, teknikPenilaianId, mataKuliahId, nilai, semester, tahunAjaran, catatan } = req.body;

        // Validate required fields
        if (!mahasiswaId || !teknikPenilaianId || !mataKuliahId || nilai === undefined || !semester || !tahunAjaran) {
            return res.status(400).json({
                error: 'Mahasiswa, teknik penilaian, mata kuliah, nilai, semester, dan tahun ajaran harus diisi'
            });
        }

        // Validate nilai range
        const nilaiNum = parseFloat(nilai);
        if (nilaiNum < 0 || nilaiNum > 100) {
            return res.status(400).json({ error: 'Nilai harus antara 0-100' });
        }

        // Check if teknik penilaian exists and get CPMK
        const teknik = await prisma.teknikPenilaian.findUnique({
            where: { id: teknikPenilaianId },
            include: {
                cpmk: true
            }
        });

        if (!teknik) {
            return res.status(404).json({ error: 'Teknik penilaian tidak ditemukan' });
        }

        // Check CPMK validation status
        if (teknik.cpmk.statusValidasi !== 'active' && teknik.cpmk.statusValidasi !== 'validated') {
            return res.status(400).json({
                error: 'CPMK belum divalidasi. Harap validasi CPMK terlebih dahulu sebelum input nilai.'
            });
        }

        // Upsert nilai teknik
        const nilaiTeknik = await prisma.nilaiTeknikPenilaian.upsert({
            where: {
                mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                    mahasiswaId,
                    teknikPenilaianId,
                    semester: parseInt(semester),
                    tahunAjaran
                }
            },
            update: {
                nilai: nilaiNum,
                catatan: catatan?.trim() || null,
                updatedAt: new Date()
            },
            create: {
                mahasiswaId,
                teknikPenilaianId,
                mataKuliahId,
                nilai: nilaiNum,
                semester: parseInt(semester),
                tahunAjaran,
                catatan: catatan?.trim() || null,
                createdBy: userId
            },
            include: {
                teknikPenilaian: {
                    include: {
                        cpmk: true
                    }
                }
            }
        });

        // Trigger auto-calculate CPMK nilai
        await calculateNilaiCpmk(mahasiswaId, teknik.cpmkId, mataKuliahId, parseInt(semester), tahunAjaran);

        res.status(201).json({
            data: nilaiTeknik,
            message: 'Nilai teknik penilaian berhasil disimpan'
        });
    } catch (error) {
        console.error('Create nilai teknik error:', error);
        res.status(500).json({ error: 'Gagal menyimpan nilai' });
    }
});

// Batch input nilai (untuk multiple mahasiswa)
router.post('/batch', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { entries } = req.body; // Array of { mahasiswaId, teknikPenilaianId, mataKuliahId, nilai, semester, tahunAjaran }

        if (!Array.isArray(entries)) {
            return res.status(400).json({ error: 'Entries harus berupa array' });
        }

        // Manual pengampu validation (mataKuliahId in body array)
        if (userRole === 'dosen' && entries.length > 0) {
            const mataKuliahId = entries[0]?.mataKuliahId;
            if (mataKuliahId) {
                const profile = await prisma.profile.findUnique({
                    where: { userId }
                });

                if (profile) {
                    const pengampu = await prisma.mataKuliahPengampu.findFirst({
                        where: {
                            mataKuliahId,
                            dosenId: profile.id
                        }
                    });

                    if (!pengampu) {
                        return res.status(403).json({
                            error: 'Forbidden - You are not pengampu of this mata kuliah'
                        });
                    }
                }
            }
        }

        const results = [];
        const errors = [];

        for (const entry of entries) {
            try {
                const { mahasiswaId, teknikPenilaianId, mataKuliahId, nilai, semester, tahunAjaran } = entry;

                // Validate
                if (!mahasiswaId || !teknikPenilaianId || nilai === undefined) {
                    errors.push({ entry, error: 'Data tidak lengkap' });
                    continue;
                }

                const nilaiNum = parseFloat(nilai);
                if (nilaiNum < 0 || nilaiNum > 100) {
                    errors.push({ entry, error: 'Nilai harus 0-100' });
                    continue;
                }

                // [NEW VALIDATION] Check CPMK status before allowing input
                const teknikPenilaian = await prisma.teknikPenilaian.findUnique({
                    where: { id: teknikPenilaianId },
                    include: {
                        cpmk: {
                            select: {
                                statusValidasi: true,
                                kodeCpmk: true
                            }
                        }
                    }
                });

                if (!teknikPenilaian) {
                    errors.push({ entry, error: 'Teknik penilaian tidak ditemukan' });
                    continue;
                }

                // Only allow grading if CPMK is validated or active
                if (teknikPenilaian.cpmk.statusValidasi === 'draft') {
                    errors.push({
                        entry,
                        error: `CPMK ${teknikPenilaian.cpmk.kodeCpmk} masih dalam status DRAFT. Minta Kaprodi untuk memvalidasi terlebih dahulu.`
                    });
                    continue;
                }

                // Upsert
                const nilaiTeknik = await prisma.nilaiTeknikPenilaian.upsert({
                    where: {
                        mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                            mahasiswaId,
                            teknikPenilaianId,
                            semester: parseInt(semester),
                            tahunAjaran
                        }
                    },
                    update: {
                        nilai: nilaiNum,
                        updatedAt: new Date()
                    },
                    create: {
                        mahasiswaId,
                        teknikPenilaianId,
                        mataKuliahId,
                        nilai: nilaiNum,
                        semester: parseInt(semester),
                        tahunAjaran,
                        createdBy: userId
                    }
                });

                results.push(nilaiTeknik);

                // Get CPMK ID for calculation
                const teknik = await prisma.teknikPenilaian.findUnique({
                    where: { id: teknikPenilaianId }
                });
                if (teknik) {
                    await calculateNilaiCpmk(mahasiswaId, teknik.cpmkId, mataKuliahId, parseInt(semester), tahunAjaran);
                }
            } catch (err) {
                errors.push({ entry, error: err instanceof Error ? err.message : 'Unknown error' });
            }
        }

        res.status(201).json({
            message: `${results.length} nilai berhasil disimpan`,
            data: results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Batch input error:', error);
        res.status(500).json({ error: 'Gagal melakukan batch input' });
    }
});

// Update nilai teknik
router.put('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nilai, catatan } = req.body;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const existing = await prisma.nilaiTeknikPenilaian.findUnique({
            where: { id },
            include: {
                teknikPenilaian: {
                    include: {
                        cpmk: {
                            include: {
                                mataKuliah: {
                                    include: {
                                        pengampu: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Nilai tidak ditemukan' });
        }

        // Check pengampu for dosen
        if (userRole === 'dosen') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            const isPengampu = existing.teknikPenilaian.cpmk.mataKuliah.pengampu.some(
                p => p.dosenId === profile?.id
            );

            if (!isPengampu) {
                return res.status(403).json({
                    error: 'Forbidden - You are not pengampu of this mata kuliah'
                });
            }
        }

        const nilaiNum = parseFloat(nilai);
        if (nilaiNum < 0 || nilaiNum > 100) {
            return res.status(400).json({ error: 'Nilai harus 0-100' });
        }

        const updated = await prisma.nilaiTeknikPenilaian.update({
            where: { id },
            data: {
                nilai: nilaiNum,
                catatan: catatan?.trim() || null,
                updatedAt: new Date()
            }
        });

        // Recalculate CPMK
        await calculateNilaiCpmk(
            existing.mahasiswaId,
            existing.teknikPenilaian.cpmkId,
            existing.mataKuliahId,
            existing.semester,
            existing.tahunAjaran
        );

        res.json({
            data: updated,
            message: 'Nilai berhasil diupdate'
        });
    } catch (error) {
        console.error('Update nilai teknik error:', error);
        res.status(500).json({ error: 'Gagal update nilai' });
    }
});

// Delete nilai teknik
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const existing = await prisma.nilaiTeknikPenilaian.findUnique({
            where: { id },
            include: {
                teknikPenilaian: {
                    include: {
                        cpmk: {
                            include: {
                                mataKuliah: {
                                    include: {
                                        pengampu: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Nilai tidak ditemukan' });
        }

        // Check pengampu for dosen
        if (userRole === 'dosen') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            const isPengampu = existing.teknikPenilaian.cpmk.mataKuliah.pengampu.some(
                p => p.dosenId === profile?.id
            );

            if (!isPengampu) {
                return res.status(403).json({
                    error: 'Forbidden - You are not pengampu of this mata kuliah'
                });
            }
        }

        await prisma.nilaiTeknikPenilaian.delete({
            where: { id }
        });

        // Recalculate CPMK
        await calculateNilaiCpmk(
            existing.mahasiswaId,
            existing.teknikPenilaian.cpmkId,
            existing.mataKuliahId,
            existing.semester,
            existing.tahunAjaran
        );

        res.json({ message: 'Nilai berhasil dihapus' });
    } catch (error) {
        console.error('Delete nilai teknik error:', error);
        res.status(500).json({ error: 'Gagal hapus nilai' });
    }
});

// Helper functions moved to ../lib/calculation.ts

// ============================================
// EXCEL IMPORT / EXPORT
// ============================================

import * as XLSX from 'xlsx';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// Generate Template Excel
router.get('/template/:mataKuliahId', authMiddleware, requirePengampu('mataKuliahId'), async (req, res) => {
    try {
        const { mataKuliahId } = req.params;

        // Get Mata Kuliah info
        const mk = await prisma.mataKuliah.findUnique({
            where: { id: mataKuliahId }
        });

        if (!mk) return res.status(404).json({ error: 'Mata Kuliah tidak ditemukan' });

        // Get CPMK & Teknik Penilaian
        const cpmkList = await prisma.cpmk.findMany({
            where: { mataKuliahId },
            include: {
                teknikPenilaian: true
            },
            orderBy: { kodeCpmk: 'asc' }
        });

        // Get Mahasiswa List (who have sessions/roles, or just all mahasiswa)
        // For simplicity, get all mahasiswa. Ideally filter by KRS if available.
        const mahasiswaList = await prisma.user.findMany({
            where: {
                role: { role: 'mahasiswa' },
                profile: { isNot: null }
            },
            include: { profile: true },
            orderBy: { profile: { nim: 'asc' } }
        });

        // Prepare Header
        const headers = ['No', 'NIM', 'Nama Mahasiswa'];
        const teknikIds: string[] = [];

        // Dynamic Headers for Teknik Penilaian
        cpmkList.forEach(cpmk => {
            cpmk.teknikPenilaian.forEach(teknik => {
                headers.push(`${cpmk.kodeCpmk} - ${teknik.namaTeknik} (${teknik.bobotPersentase}%)`);
                teknikIds.push(teknik.id);
            });
        });

        // Prepare Data Rows
        const data = mahasiswaList.map((m, index) => {
            const row: any = {
                'No': index + 1,
                'NIM': m.profile?.nim || '-',
                'Nama Mahasiswa': m.profile?.namaLengkap || '-'
            };

            // Initialize empty grades
            teknikIds.forEach((id, idx) => {
                // Use header name as key
                row[headers[3 + idx]] = '';
            });

            return row;
        });

        // Create Workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data, { header: headers });

        // Set column widths
        const wscols = [
            { wch: 5 },  // No
            { wch: 15 }, // NIM
            { wch: 30 }, // Nama
            ...teknikIds.map(() => ({ wch: 20 })) // Teknik columns
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, 'Nilai');

        // Write to buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="Template_Nilai_${mk.kodeMk}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Generate template error:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
});

// Import Excel  
router.post('/import', authMiddleware, requireRole('admin', 'dosen'), requirePengampu('mataKuliahId'), upload.single('file'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { mataKuliahId, semester, tahunAjaran } = req.body;
        const file = req.file;

        if (!file || !mataKuliahId || !semester || !tahunAjaran) {
            return res.status(400).json({ error: 'File, mata kuliah, semester, dan tahun ajaran harus diisi' });
        }

        // Get CPMK & Teknik Penilaian Map
        const cpmkList = await prisma.cpmk.findMany({
            where: { mataKuliahId },
            include: { teknikPenilaian: true }
        });

        // Map Header Name to Teknik ID
        // Header format: "CPMK1 - Tugas (20%)"
        const headerToTeknikId = new Map<string, string>();
        cpmkList.forEach(cpmk => {
            cpmk.teknikPenilaian.forEach(teknik => {
                const headerName = `${cpmk.kodeCpmk} - ${teknik.namaTeknik} (${teknik.bobotPersentase}%)`;
                headerToTeknikId.set(headerName, teknik.id);
            });
        });

        // Parse Excel
        const wb = XLSX.read(file.buffer, { type: 'buffer' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        const errors: string[] = [];

        // Process each row
        for (const row of data) {
            const nim = row['NIM'];
            if (!nim) continue;

            // Find Mahasiswa ID by NIM
            const mahasiswa = await prisma.profile.findUnique({
                where: { nim: String(nim) },
                select: { userId: true }
            });

            if (!mahasiswa) {
                errors.push(`NIM ${nim} tidak ditemukan`);
                continue;
            }

            // Iterate columns to find grades
            for (const [key, value] of Object.entries(row)) {
                if (headerToTeknikId.has(key)) {
                    const teknikId = headerToTeknikId.get(key)!;
                    const nilai = parseFloat(value as string);

                    if (!isNaN(nilai) && nilai >= 0 && nilai <= 100) {
                        // Upsert Nilai
                        await prisma.nilaiTeknikPenilaian.upsert({
                            where: {
                                mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                                    mahasiswaId: mahasiswa.userId,
                                    teknikPenilaianId: teknikId,
                                    semester: parseInt(semester),
                                    tahunAjaran
                                }
                            },
                            update: {
                                nilai,
                                updatedAt: new Date()
                            },
                            create: {
                                mahasiswaId: mahasiswa.userId,
                                teknikPenilaianId: teknikId,
                                mataKuliahId,
                                nilai,
                                semester: parseInt(semester),
                                tahunAjaran,
                                createdBy: userId
                            }
                        });
                        successCount++;
                    }
                }
            }
        }

        // Trigger Recalculation (Async)
        // We need to recalculate for all affected CPMKs
        // For simplicity, just trigger for all CPMKs in this MK for the affected students
        // Or simpler: Just return success and let user verify. 
        // Ideally we should trigger calculation. Let's trigger for the first student to be safe or loop.
        // Optimization: Calculate per CPMK batch?
        // For now, let's just trigger for all CPMKs of this MK for the students involved.
        // This might be slow if many students. 
        // Let's rely on the fact that individual upsert triggers calculation? 
        // Wait, individual upsert in the loop above DOES NOT trigger calculation because we used prisma.upsert directly, 
        // NOT the API endpoint logic.

        // We must trigger calculation manually.
        // Let's do it for all CPMKs in this MK for the current semester/TA
        // This is a heavy operation. Let's do it for each CPMK.

        for (const cpmk of cpmkList) {
            // We need to calculate for ALL students in this semester/TA
            // But calculateNilaiCpmk is per student.
            // Let's just iterate over the students we processed.
            const processedStudentIds = new Set<string>();
            for (const row of data) {
                const nim = row['NIM'];
                if (nim) {
                    const m = await prisma.profile.findUnique({ where: { nim: String(nim) }, select: { userId: true } });
                    if (m) processedStudentIds.add(m.userId);
                }
            }

            for (const mId of processedStudentIds) {
                await calculateNilaiCpmk(mId, cpmk.id, mataKuliahId, parseInt(semester), tahunAjaran);
            }
        }

        res.json({
            message: `Import berhasil. ${successCount} nilai disimpan.`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import excel error:', error);
        res.status(500).json({ error: 'Gagal import file' });
    }
});

export default router;
