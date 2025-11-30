
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/:mahasiswaId', async (req, res) => {
    try {
        const { mahasiswaId } = req.params;
        const { semester, tahunAjaran } = req.query;

        // Get mahasiswa info
        const mahasiswa = await prisma.profile.findUnique({
            where: { userId: mahasiswaId },
            include: {
                prodi: true
            }
        });

        if (!mahasiswa) {
            return res.status(404).json({ success: false, error: 'Mahasiswa tidak ditemukan' });
        }

        // Build filter
        const where: any = { mahasiswaId };
        if (semester && semester !== 'all') {
            where.semester = Number(semester);
        }
        if (tahunAjaran && tahunAjaran !== 'all') {
            where.tahunAjaran = String(tahunAjaran);
        }

        // Fetch Nilai CPMK
        const nilaiCpmkList = await prisma.nilaiCpmk.findMany({
            where,
            include: {
                cpmk: true,
                mataKuliah: true
            },
            orderBy: [
                { semester: 'asc' },
                { mataKuliah: { kodeMk: 'asc' } },
                { cpmk: { kodeCpmk: 'asc' } }
            ]
        });

        // Format response
        const transkrip = nilaiCpmkList.map((item: any) => ({
            id: item.id,
            kodeCpmk: item.cpmk.kodeCpmk,
            deskripsi: item.cpmk.deskripsi,
            nilai: item.nilai,
            status: item.nilai >= 70 ? 'tercapai' : 'belum_tercapai', // Threshold example
            mataKuliah: {
                kodeMk: item.mataKuliah.kodeMk,
                namaMk: item.mataKuliah.namaMk,
                sks: item.mataKuliah.sks,
                semester: item.semester
            },
            tahunAjaran: item.tahunAjaran
        }));

        res.json({
            success: true,
            mahasiswa: {
                userId: mahasiswa.userId,
                namaLengkap: mahasiswa.namaLengkap,
                nim: mahasiswa.nim,
                programStudi: mahasiswa.prodi?.nama || mahasiswa.programStudi,
                semester: mahasiswa.semester
            },
            transkrip
        });

    } catch (error) {
        console.error('Error fetching transkrip CPMK:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
