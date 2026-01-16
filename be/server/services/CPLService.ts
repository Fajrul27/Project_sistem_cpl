import { prisma } from '../lib/prisma.js';
import { academicSchemas } from '../schemas/academic.schema.js';

interface GetCplParams {
    userId: string;
    userRole: string;
    prodiId?: string;
    page?: number;
    limit?: number;
    q?: string;
    kategori?: string;
    kurikulumId?: string;
}

export class CPLService {
    // --- Helper ---
    static async getTotalBobotKontribusiMK(mataKuliahId: string): Promise<number> {
        const result = await prisma.cplMataKuliah.aggregate({
            where: { mataKuliahId },
            _sum: { bobotKontribusi: true }
        });
        return Number(result._sum.bobotKontribusi || 0);
    }

    // --- CPL Operations ---

    static async getAllCpl(params: GetCplParams) {
        const { userId, userRole, prodiId, page = 1, limit = 10, q, kategori, kurikulumId } = params;
        const where: any = { isActive: true };

        // Search Logic
        if (q) {
            where.OR = [
                { kodeCpl: { contains: q } },
                { deskripsi: { contains: q } },
                { kategori: { contains: q } }
            ];
        }

        // Kategori Filter
        if (kategori && kategori !== 'all') {
            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { kategori: kategori },
                        { kategoriRef: { nama: kategori } }
                    ]
                }
            ];
        }

        // Kurikulum Filter
        if (kurikulumId && kurikulumId !== 'all') {
            where.kurikulumId = kurikulumId;
        }

        // Access Control Logic
        if (userRole === 'kaprodi' || userRole === 'mahasiswa') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (profile?.prodiId) {
                where.prodiId = profile.prodiId;
            } else {
                return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
            }
        } else if (userRole === 'dosen') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            const prodiIds = new Set<string>();
            let hasLegacyData = false;

            if (profile?.prodiId) prodiIds.add(profile.prodiId);
            else if (profile?.programStudi) hasLegacyData = true;

            const teaching = await prisma.mataKuliahPengampu.findMany({
                where: { dosenId: userId },
                include: { mataKuliah: true }
            });

            teaching.forEach(t => {
                if (t.mataKuliah.prodiId) prodiIds.add(t.mataKuliah.prodiId);
                else if (t.mataKuliah.programStudi) hasLegacyData = true;
            });

            if (prodiIds.size > 0) {
                where.prodiId = { in: Array.from(prodiIds) };
            } else if (!hasLegacyData) {
                return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
            }
        }

        if (prodiId && userRole === 'admin') {
            where.prodiId = prodiId;
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.cpl.findMany({
                where,
                include: { kategoriRef: true, prodi: true, kurikulum: true },
                orderBy: { kodeCpl: 'asc' },
                skip: limit > 0 ? skip : undefined,
                take: limit > 0 ? limit : undefined,
            }),
            prisma.cpl.count({ where })
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: limit > 0 ? Math.ceil(total / limit) : 1
            }
        };
    }

    static async getCplById(id: string) {
        const cpl = await prisma.cpl.findUnique({
            where: { id },
            include: {
                mataKuliah: { include: { mataKuliah: true } },
                kategoriRef: true,
                prodi: true
            }
        });
        if (!cpl) throw new Error('CPL tidak ditemukan');
        return cpl;
    }

    static async getCplStats(id: string) {
        // Fetch all grades for this CPL
        const nilaiList = await prisma.nilaiCpl.findMany({
            where: { cplId: id },
            include: { mataKuliah: true, tahunAjaranRef: true }
        });

        if (nilaiList.length === 0) {
            return {
                avgNilai: 0,
                totalMahasiswa: 0,
                totalMK: 0,
                trend: 'stable',
                semesterData: [],
                distribution: [],
                mkData: []
            };
        }

        // Stats Logic
        const totalNilai = nilaiList.reduce((sum, item) => sum + Number(item.nilai), 0);
        const avgNilai = totalNilai / nilaiList.length;

        const uniqueMahasiswa = new Set(nilaiList.map(n => n.mahasiswaId));
        const uniqueMK = new Set(nilaiList.map(n => n.mataKuliahId));

        // Trend
        const semesterMap = new Map();
        nilaiList.forEach(n => {
            const taName = n.tahunAjaranRef?.nama || n.tahunAjaranId || 'Unknown';
            const key = `${taName} - Sem ${n.semester}`;
            if (!semesterMap.has(key)) semesterMap.set(key, { sum: 0, count: 0, semester: key });
            const entry = semesterMap.get(key);
            entry.sum += Number(n.nilai);
            entry.count += 1;
        });

        const semesterData = Array.from(semesterMap.values())
            .map((entry: any) => ({
                semester: entry.semester,
                nilai: Number((entry.sum / entry.count).toFixed(2)),
                // Add sortable keys
                tahunAjaran: entry.semester.split(' - ')[0],
                semIndex: parseInt(entry.semester.split('Sem ')[1])
            }))
            .sort((a, b) => {
                if (a.tahunAjaran !== b.tahunAjaran) return a.tahunAjaran.localeCompare(b.tahunAjaran);
                return a.semIndex - b.semIndex;
            })
            // Clean up internal keys if needed, or keep them
            .map(({ semester, nilai }) => ({ semester, nilai }));

        let trend = 'stable';
        if (semesterData.length >= 2) {
            const last = semesterData[semesterData.length - 1].nilai;
            const prev = semesterData[semesterData.length - 2].nilai;
            if (last > prev) trend = 'up';
            else if (last < prev) trend = 'down';
        }

        // Distribution - Aggregate per Student first
        const studentScores = new Map<string, { sum: number, count: number }>();
        nilaiList.forEach(n => {
            if (!studentScores.has(n.mahasiswaId)) {
                studentScores.set(n.mahasiswaId, { sum: 0, count: 0 });
            }
            const s = studentScores.get(n.mahasiswaId)!; // Assert non-null because we just set it
            s.sum += Number(n.nilai);
            s.count += 1;
        });

        const ranges = [
            { range: '0-50', min: 0, max: 50.99, count: 0 },
            { range: '51-60', min: 51, max: 60.99, count: 0 },
            { range: '61-70', min: 61, max: 70.99, count: 0 },
            { range: '71-80', min: 71, max: 80.99, count: 0 },
            { range: '81-100', min: 81, max: 100, count: 0 },
        ];

        studentScores.forEach((data) => {
            const avg = data.sum / data.count;
            const range = ranges.find(r => avg >= r.min && avg <= r.max);
            if (range) range.count++;
        });

        // MK Ranking
        const mkMap = new Map();
        nilaiList.forEach(n => {
            const mkName = n.mataKuliah.namaMk;
            if (!mkMap.has(mkName)) mkMap.set(mkName, { sum: 0, count: 0, name: mkName });
            const entry = mkMap.get(mkName);
            entry.sum += Number(n.nilai);
            entry.count += 1;
        });

        const mkData = Array.from(mkMap.values())
            .map((entry: any) => ({
                name: entry.name,
                nilai: Number((entry.sum / entry.count).toFixed(2))
            }))
            .sort((a, b) => b.nilai - a.nilai)
            .slice(0, 10);

        return {
            avgNilai: Number(avgNilai.toFixed(2)),
            totalMahasiswa: uniqueMahasiswa.size,
            totalMK: uniqueMK.size,
            trend,
            semesterData,
            distribution: ranges.map(r => ({ range: r.range, count: r.count })),
            mkData
        };
    }

    static async createCpl(data: any, userId: string, userRole: string) {
        const validated = academicSchemas.cpl.parse(data);
        const { kodeCpl, deskripsi, kategori, kategoriId, prodiId } = validated;
        let finalProdiId = prodiId;

        if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (!profile?.prodiId) throw new Error('Profil Kaprodi tidak memiliki Program Studi');
            finalProdiId = profile.prodiId;
        }

        return prisma.cpl.create({
            data: {
                kodeCpl,
                deskripsi,
                kategori,
                kategoriId,
                prodiId: finalProdiId,
                kurikulumId: validated.kurikulumId || null,
                createdBy: userId
            },
            include: { kategoriRef: true, prodi: true, kurikulum: true }
        });
    }

    static async updateCpl(id: string, data: any, userId: string, userRole: string) {
        const validated = academicSchemas.cpl.parse(data);
        const { kodeCpl, deskripsi, kategori, kategoriId, prodiId } = validated;

        const existing = await prisma.cpl.findUnique({ where: { id } });
        if (!existing) throw new Error('CPL tidak ditemukan');

        if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (existing.createdBy !== userId && existing.prodiId !== profile?.prodiId) {
                throw new Error('FORBIDDEN');
            }
        }

        const updateData: any = { kodeCpl, deskripsi, kategori, kategoriId, kurikulumId: validated.kurikulumId || null };
        if (userRole === 'admin') updateData.prodiId = prodiId;

        return prisma.cpl.update({
            where: { id },
            data: updateData,
            include: { kategoriRef: true, prodi: true, kurikulum: true }
        });
    }

    static async deleteCpl(id: string, userId: string, userRole: string) {
        const existing = await prisma.cpl.findUnique({ where: { id } });
        if (!existing) throw new Error('CPL tidak ditemukan');

        if (userRole === 'kaprodi') {
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (existing.createdBy !== userId && existing.prodiId !== profile?.prodiId) {
                throw new Error('FORBIDDEN');
            }
        }

        return prisma.cpl.update({
            where: { id },
            data: { isActive: false }
        });
    }


    // --- Mapping Operations ---

    static async getAllMappings() {
        return prisma.cplMataKuliah.findMany({
            include: { cpl: true, mataKuliah: true },
            orderBy: { mataKuliah: { semester: 'asc' } }
        });
    }

    static async getMappingsByMataKuliah(mkId: string) {
        const mappings = await prisma.cplMataKuliah.findMany({
            where: { mataKuliahId: mkId },
            include: { cpl: true, mataKuliah: true }
        });
        const totalBobot = await this.getTotalBobotKontribusiMK(mkId);
        return {
            data: mappings,
            meta: {
                totalBobotKontribusi: Number(totalBobot.toFixed(2)),
                isValid: Math.abs(totalBobot - 1.0) < 0.01,
                expectedTotal: 1.0
            }
        };
    }

    static async createMapping(data: any) {
        const { cplId, mataKuliahId, bobotKontribusi } = data;

        const existing = await prisma.cplMataKuliah.findFirst({
            where: { cplId, mataKuliahId }
        });
        if (existing) throw new Error('Mapping sudah ada');

        const mapping = await prisma.cplMataKuliah.create({
            data: {
                cplId,
                mataKuliahId,
                bobotKontribusi: parseFloat(bobotKontribusi) || 1.0
            },
            include: { cpl: true, mataKuliah: true }
        });

        const newTotal = await this.getTotalBobotKontribusiMK(mataKuliahId);
        if (Math.abs(newTotal - 1.0) > 0.01) {
            await prisma.cplMataKuliah.delete({ where: { id: mapping.id } });
            throw new Error(`Total bobot kontribusi harus = 100%. Total saat ini: ${(newTotal * 100).toFixed(2)}%`);
        }

        return mapping;
    }

    static async updateMapping(id: string, bobotKontribusi: any) {
        const existing = await prisma.cplMataKuliah.findUnique({ where: { id } });
        if (!existing) throw new Error('Mapping tidak ditemukan');

        const mapping = await prisma.cplMataKuliah.update({
            where: { id },
            data: { bobotKontribusi: parseFloat(bobotKontribusi) || 1.0 },
            include: { cpl: true, mataKuliah: true }
        });

        const newTotal = await this.getTotalBobotKontribusiMK(existing.mataKuliahId);
        if (Math.abs(newTotal - 1.0) > 0.01) {
            await prisma.cplMataKuliah.update({
                where: { id },
                data: { bobotKontribusi: existing.bobotKontribusi }
            });
            throw new Error(`Total bobot kontribusi harus = 100%. Total saat ini: ${(newTotal * 100).toFixed(2)}%`);
        }
        return mapping;
    }

    static async deleteMapping(id: string) {
        return prisma.cplMataKuliah.delete({ where: { id } });
    }

    static async batchCreateMappings(mappingData: any[]) {
        if (!Array.isArray(mappingData)) throw new Error('Mappings must be an array');

        // Validation Logic
        const groupedByMK = mappingData.reduce((acc: any, m: any) => {
            if (!acc[m.mataKuliahId]) acc[m.mataKuliahId] = [];
            acc[m.mataKuliahId].push(m);
            return acc;
        }, {});

        for (const [mkId, mappings] of Object.entries(groupedByMK)) {
            const total = (mappings as any[]).reduce((sum, m) => sum + (parseFloat(m.bobotKontribusi) || 1.0), 0);
            if (Math.abs(total - 1.0) > 0.01) {
                throw new Error(`Total bobot kontribusi untuk Mata Kuliah ini harus = 100%. Total: ${(total * 100).toFixed(2)}%`);
            }
        }

        return prisma.cplMataKuliah.createMany({
            data: mappingData.map((m: any) => ({
                cplId: m.cplId,
                mataKuliahId: m.mataKuliahId,
                bobotKontribusi: parseFloat(m.bobotKontribusi) || 1.0
            })),
            skipDuplicates: true
        });
    }
}
