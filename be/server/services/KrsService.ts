import { prisma } from '../lib/prisma.js';
import { academicSchemas } from '../schemas/academic.schema.js';

export class KrsService {
    static async getAllKrs(params: {
        prodiId?: string;
        semesterId?: string;
        tahunAjaranId?: string;
        kelasId?: string;
        q?: string;
        page?: number;
        limit?: number;
    }) {
        const { prodiId, semesterId, tahunAjaranId, kelasId, q, page = 1, limit = 10 } = params;
        const where: any = {};

        if (semesterId) where.semesterId = semesterId;
        if (tahunAjaranId) where.tahunAjaranId = tahunAjaranId;

        if (q || prodiId || kelasId) {
            where.mahasiswa = {
                ...(prodiId && { prodiId }),
                ...(kelasId && { kelasId }),
                ...(q && {
                    OR: [
                        { namaLengkap: { contains: q } },
                        { nim: { contains: q } }
                    ]
                })
            };
        }

        const skip = (page - 1) * limit;
        const take = limit;

        const [data, total] = await Promise.all([
            prisma.krs.findMany({
                where,
                skip,
                take,
                include: {
                    mahasiswa: {
                        select: {
                            userId: true,
                            namaLengkap: true,
                            nim: true,
                            prodi: { select: { nama: true } }
                        }
                    },
                    mataKuliah: {
                        select: {
                            id: true,
                            kodeMk: true,
                            namaMk: true,
                            sks: true
                        }
                    },
                    semester: true,
                    tahunAjaran: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.krs.count({ where })
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async importKrs(data: any[], userId: string, userRole: string) {
        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        for (const row of data) {
            rowNumber++;
            const { nim, kodeMk, semesterAngka, tahunAjaranNama } = row;

            if (!nim || !kodeMk) {
                errors.push(`Baris ${rowNumber}: NIM dan Kode MK harus diisi`);
                continue;
            }

            try {
                // 1. Find Mahasiswa
                const profile = await prisma.profile.findUnique({
                    where: { nim: nim.toString() }
                });

                if (!profile) {
                    errors.push(`Baris ${rowNumber}: Mahasiswa dengan NIM ${nim} tidak ditemukan`);
                    continue;
                }

                // 2. Find Mata Kuliah
                const mk = await prisma.mataKuliah.findUnique({
                    where: { kodeMk: kodeMk.toString() }
                });

                if (!mk) {
                    errors.push(`Baris ${rowNumber}: Mata Kuliah dengan Kode ${kodeMk} tidak ditemukan`);
                    continue;
                }

                // 3. Find Semester by number (angka)
                const semester = await prisma.semester.findFirst({
                    where: { angka: parseInt(semesterAngka) }
                });

                if (!semester) {
                    errors.push(`Baris ${rowNumber}: Semester ${semesterAngka} tidak ditemukan`);
                    continue;
                }

                // 4. Find Tahun Ajaran
                const tahunAjaran = await prisma.tahunAjaran.findFirst({
                    where: { nama: tahunAjaranNama }
                });

                if (!tahunAjaran) {
                    errors.push(`Baris ${rowNumber}: Tahun Ajaran ${tahunAjaranNama} tidak ditemukan`);
                    continue;
                }

                // 5. Upsert KRS
                await prisma.krs.upsert({
                    where: {
                        mahasiswaId_mataKuliahId_semesterId_tahunAjaranId: {
                            mahasiswaId: profile.userId,
                            mataKuliahId: mk.id,
                            semesterId: semester.id,
                            tahunAjaranId: tahunAjaran.id
                        }
                    },
                    update: {},
                    create: {
                        mahasiswaId: profile.userId,
                        mataKuliahId: mk.id,
                        semesterId: semester.id,
                        tahunAjaranId: tahunAjaran.id
                    }
                });

                successes.push({ nim, kodeMk });
            } catch (error: any) {
                errors.push(`Baris ${rowNumber}: ${error.message}`);
            }
        }

        return {
            message: `Import selesai. ${successes.length} data berhasil diproses.`,
            successCount: successes.length,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    static async createKrs(data: any) {
        const validated = academicSchemas.krs.parse(data);
        return prisma.krs.upsert({
            where: {
                mahasiswaId_mataKuliahId_semesterId_tahunAjaranId: {
                    mahasiswaId: validated.mahasiswaId,
                    mataKuliahId: validated.mataKuliahId,
                    semesterId: validated.semesterId,
                    tahunAjaranId: validated.tahunAjaranId
                }
            },
            update: {},
            create: {
                mahasiswaId: validated.mahasiswaId,
                mataKuliahId: validated.mataKuliahId,
                semesterId: validated.semesterId,
                tahunAjaranId: validated.tahunAjaranId
            }
        });
    }

    static async deleteKrs(id: string) {
        return prisma.krs.delete({ where: { id } });
    }
}
