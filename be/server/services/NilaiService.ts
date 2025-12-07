import { prisma } from '../lib/prisma.js';
import { calculateNilaiCpmk } from '../lib/calculation.js';
import { gradingSchemas } from '../schemas/grading.schema.js';
import { UserService } from './UserService.js';
import * as XLSX from 'xlsx';

export class NilaiService {
    static async getNilaiByMahasiswa(mahasiswaId: string, semester?: number, tahunAjaran?: string) {
        const where: any = { mahasiswaId };
        if (semester) where.semester = semester;
        if (tahunAjaran) where.tahunAjaran = tahunAjaran;

        return prisma.nilaiTeknikPenilaian.findMany({
            where,
            include: {
                teknikPenilaian: {
                    include: {
                        cpmk: {
                            include: { mataKuliah: true }
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
    }

    static async getNilaiByCpmk(cpmkId: string, mahasiswaId: string, semester?: number, tahunAjaran?: string) {
        const teknikList = await prisma.teknikPenilaian.findMany({
            where: { cpmkId },
            orderBy: { createdAt: 'asc' }
        });

        return Promise.all(
            teknikList.map(async (teknik) => {
                const where: any = {
                    mahasiswaId,
                    teknikPenilaianId: teknik.id
                };
                if (semester) where.semester = semester;
                if (tahunAjaran) where.tahunAjaran = tahunAjaran;

                const nilai = await prisma.nilaiTeknikPenilaian.findFirst({ where });
                return {
                    teknikPenilaian: teknik,
                    nilai: nilai || null
                };
            })
        );
    }

    static async getNilaiByMataKuliah(mataKuliahId: string, semester?: number, tahunAjaran?: string) {
        const where: any = { mataKuliahId };
        if (semester) where.semester = semester;
        if (tahunAjaran) where.tahunAjaran = tahunAjaran;

        return prisma.nilaiTeknikPenilaian.findMany({
            where,
            select: {
                mahasiswaId: true,
                teknikPenilaianId: true,
                nilai: true,
                updatedAt: true
            }
        });
    }

    static async createOrUpdateNilai(data: any, userId: string) {
        const validated = gradingSchemas.nilaiSingle.parse(data);
        const { mahasiswaId, teknikPenilaianId, mataKuliahId, nilai, semester, tahunAjaran, catatan, rubrikData } = validated;

        const teknik = await prisma.teknikPenilaian.findUnique({
            where: { id: teknikPenilaianId },
            include: { cpmk: true }
        });

        if (!teknik) throw new Error('TEKNIK_NOT_FOUND');
        if (teknik.cpmk.mataKuliahId !== mataKuliahId) throw new Error('MISMATCH_MK');
        // if (teknik.cpmk.statusValidasi !== 'active' && teknik.cpmk.statusValidasi !== 'validated') {
        //     throw new Error('CPMK_NOT_VALIDATED');
        // }

        const nilaiTeknik = await prisma.nilaiTeknikPenilaian.upsert({
            where: {
                mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                    mahasiswaId,
                    teknikPenilaianId,
                    semester: semester,
                    tahunAjaran
                }
            },
            update: {
                nilai: nilai,
                catatan: catatan?.trim() || null,
                updatedAt: new Date()
            },
            create: {
                mahasiswaId,
                teknikPenilaianId,
                mataKuliahId,
                nilai: nilai,
                semester: semester,
                tahunAjaran,
                catatan: catatan?.trim() || null,
                createdBy: userId
            },
            include: { teknikPenilaian: { include: { cpmk: true } } }
        });

        if (Array.isArray(rubrikData) && rubrikData.length > 0) {
            await prisma.nilaiRubrik.deleteMany({ where: { nilaiTeknikId: nilaiTeknik.id } });
            await prisma.nilaiRubrik.createMany({
                data: rubrikData.map((r: any) => ({
                    nilaiTeknikId: nilaiTeknik.id,
                    rubrikLevelId: r.rubrikLevelId
                }))
            });
        }

        await calculateNilaiCpmk(mahasiswaId, teknik.cpmkId, mataKuliahId, semester, tahunAjaran);

        return nilaiTeknik;
    }

    static async batchInputNilai(data: any, userId: string, userRole: string) {
        const { entries } = data;
        if (!Array.isArray(entries)) throw new Error('INVALID_ENTRIES');

        if (userRole === 'dosen' && entries.length > 0) {
            const mataKuliahId = entries[0]?.mataKuliahId;
            if (mataKuliahId) {
                const isPengampu = await prisma.mataKuliahPengampu.findFirst({
                    where: { mataKuliahId, dosenId: userId }
                });
                if (!isPengampu) throw new Error('FORBIDDEN_PENGAMPU');
            }
        }

        const results = [];
        const errors = [];

        for (const entry of entries) {
            try {
                const { mahasiswaId, teknikPenilaianId, mataKuliahId, nilai, semester, tahunAjaran } = entry;
                if (!mahasiswaId || !teknikPenilaianId || nilai === undefined) {
                    errors.push({ entry, error: 'Data tidak lengkap' });
                    continue;
                }

                const nilaiNum = parseFloat(nilai);
                if (nilaiNum < 0 || nilaiNum > 100) {
                    errors.push({ entry, error: 'Nilai harus 0-100' });
                    continue;
                }

                const teknikPenilaian = await prisma.teknikPenilaian.findUnique({
                    where: { id: teknikPenilaianId },
                    include: { cpmk: true }
                });

                if (!teknikPenilaian) {
                    errors.push({ entry, error: 'Teknik penilaian tidak ditemukan' });
                    continue;
                }

                if (teknikPenilaian.cpmk.mataKuliahId !== mataKuliahId) {
                    errors.push({ entry, error: 'Teknik penilaian tidak sesuai dengan mata kuliah' });
                    continue;
                }

                // if (teknikPenilaian.cpmk.statusValidasi === 'draft') {
                //      errors.push({ entry, error: `CPMK ${teknikPenilaian.cpmk.kodeCpmk} masih draft` });
                //      continue;
                // }

                const nilaiTeknik = await prisma.nilaiTeknikPenilaian.upsert({
                    where: {
                        mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                            mahasiswaId,
                            teknikPenilaianId,
                            semester: parseInt(semester),
                            tahunAjaran
                        }
                    },
                    update: { nilai: nilaiNum, updatedAt: new Date() },
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

                if (Array.isArray(entry.rubrikData) && entry.rubrikData.length > 0) {
                    await prisma.nilaiRubrik.deleteMany({ where: { nilaiTeknikId: nilaiTeknik.id } });
                    await prisma.nilaiRubrik.createMany({
                        data: entry.rubrikData.map((r: any) => ({
                            nilaiTeknikId: nilaiTeknik.id,
                            rubrikLevelId: r.rubrikLevelId
                        }))
                    });
                }

                results.push(nilaiTeknik);
                await calculateNilaiCpmk(mahasiswaId, teknikPenilaian.cpmkId, mataKuliahId, parseInt(semester), tahunAjaran);

            } catch (err: any) {
                errors.push({ entry, error: err.message || 'Unknown error' });
            }
        }

        return { results, errors };
    }

    static async updateNilai(id: string, data: any, userId: string, userRole: string) {
        const { nilai, catatan } = data;
        const existing = await prisma.nilaiTeknikPenilaian.findUnique({
            where: { id },
            include: { teknikPenilaian: { include: { cpmk: { include: { mataKuliah: { include: { pengampu: true } } } } } } }
        });

        if (!existing) throw new Error('NOT_FOUND');

        if (userRole === 'dosen') {
            const isPengampu = existing.teknikPenilaian.cpmk.mataKuliah.pengampu.some(p => p.dosenId === userId);
            if (!isPengampu) throw new Error('FORBIDDEN_PENGAMPU');
        }

        const nilaiNum = parseFloat(nilai);
        if (nilaiNum < 0 || nilaiNum > 100) throw new Error('INVALID_NILAI');

        const updated = await prisma.nilaiTeknikPenilaian.update({
            where: { id },
            data: {
                nilai: nilaiNum,
                catatan: catatan?.trim() || null,
                updatedAt: new Date()
            }
        });

        await calculateNilaiCpmk(
            existing.mahasiswaId,
            existing.teknikPenilaian.cpmkId,
            existing.mataKuliahId,
            existing.semester,
            existing.tahunAjaran
        );

        return updated;
    }

    static async deleteNilai(id: string, userId: string, userRole: string) {
        const existing = await prisma.nilaiTeknikPenilaian.findUnique({
            where: { id },
            include: { teknikPenilaian: { include: { cpmk: { include: { mataKuliah: { include: { pengampu: true } } } } } } }
        });

        if (!existing) throw new Error('NOT_FOUND');

        if (userRole === 'dosen') {
            const isPengampu = existing.teknikPenilaian.cpmk.mataKuliah.pengampu.some(p => p.dosenId === userId);
            if (!isPengampu) throw new Error('FORBIDDEN_PENGAMPU');
        }

        await prisma.nilaiTeknikPenilaian.delete({ where: { id } });

        await calculateNilaiCpmk(
            existing.mahasiswaId,
            existing.teknikPenilaian.cpmkId,
            existing.mataKuliahId,
            existing.semester,
            existing.tahunAjaran
        );
    }

    static async generateTemplate(mataKuliahId: string, kelasId?: string, userId?: string, userRole?: string, semester?: number, tahunAjaran?: string) {
        const mk = await prisma.mataKuliah.findUnique({ where: { id: mataKuliahId } });
        if (!mk) throw new Error('MK_NOT_FOUND');

        const cpmkList = await prisma.cpmk.findMany({
            where: { mataKuliahId },
            include: { teknikPenilaian: true },
            orderBy: { kodeCpmk: 'asc' }
        });

        let mahasiswaData: any[] = [];

        if (kelasId) {
            // Use UserService to ensure exact parity with UI filters/security
            const result = await UserService.getAllUsers({
                role: 'mahasiswa',
                kelasId,
                limit: -1,
                page: 1,
                userId: userId || '',
                userRole: userRole || '',
                sortBy: 'nim',
                sortOrder: 'asc'
            });
            mahasiswaData = result.data;
        } else {
            // Fallback for non-class specific export (e.g. validasi checks?)
            let targetKelasIds: string[] = [];
            const pengampuWhere: any = { mataKuliahId };
            if (userRole === 'dosen' && userId) pengampuWhere.dosenId = userId;

            const pengampuClasses = await prisma.mataKuliahPengampu.findMany({
                where: pengampuWhere,
                select: { kelasId: true }
            });
            targetKelasIds = pengampuClasses.map(p => p.kelasId).filter((id): id is string => id !== null);

            const mahasiswaWhere: any = {
                role: { role: 'mahasiswa' },
                profile: { kelasId: { in: targetKelasIds } }
            };

            if (mk.prodiId) mahasiswaWhere.profile.prodiId = mk.prodiId;
            else if (mk.programStudi) mahasiswaWhere.profile.programStudi = mk.programStudi;

            if (semester) mahasiswaWhere.profile.semester = semester;

            mahasiswaData = await prisma.user.findMany({
                where: mahasiswaWhere,
                include: { profile: true },
                orderBy: { profile: { nim: 'asc' } }
            });
        }

        const existingGradesMap = new Map<string, Map<string, number>>();

        if (semester && tahunAjaran) {
            const grades = await prisma.nilaiTeknikPenilaian.findMany({
                where: {
                    mataKuliahId,
                    semester,
                    tahunAjaran,
                    mahasiswaId: { in: mahasiswaData.map(m => m.id) }
                }
            });
            grades.forEach(g => {
                if (!existingGradesMap.has(g.mahasiswaId)) existingGradesMap.set(g.mahasiswaId, new Map());
                existingGradesMap.get(g.mahasiswaId)!.set(g.teknikPenilaianId, Number(g.nilai));
            });
        }

        const headers = ['No', 'NIM', 'Nama Mahasiswa'];
        const teknikIds: string[] = [];
        cpmkList.forEach(cpmk => {
            cpmk.teknikPenilaian.forEach(teknik => {
                headers.push(`${cpmk.kodeCpmk} - ${teknik.namaTeknik} (${teknik.bobotPersentase}%)`);
                teknikIds.push(teknik.id);
            });
        });

        const data = mahasiswaData.map((m, index) => {
            const row: any = {
                'No': index + 1,
                'NIM': m.profile?.nim || '-',
                'Nama Mahasiswa': m.profile?.namaLengkap || '-'
            };
            const studentGrades = existingGradesMap.get(m.id);
            teknikIds.forEach((id, idx) => {
                const val = studentGrades?.get(id);
                row[headers[3 + idx]] = val !== undefined ? val : '';
            });
            return row;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data, { header: headers });
        ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 30 }, ...teknikIds.map(() => ({ wch: 20 }))];
        XLSX.utils.book_append_sheet(wb, ws, 'Nilai');

        const sanitizedMkName = mk.namaMk.replace(/[^a-zA-Z0-9]/g, '_');
        return { buffer: XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }), filename: `input_nilai_${sanitizedMkName}.xlsx` };
    }

    static async importNilai(fileBuffer: Buffer, mataKuliahId: string, semester: number, tahunAjaran: string, userId: string) {
        const cpmkList = await prisma.cpmk.findMany({
            where: { mataKuliahId },
            include: { teknikPenilaian: true }
        });

        const headerToTeknikId = new Map<string, string>();
        cpmkList.forEach(cpmk => {
            cpmk.teknikPenilaian.forEach(teknik => {
                const headerName = `${cpmk.kodeCpmk} - ${teknik.namaTeknik} (${teknik.bobotPersentase}%)`;
                headerToTeknikId.set(headerName, teknik.id);
            });
        });

        const wb = XLSX.read(fileBuffer, { type: 'buffer' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        const errors: string[] = [];
        const processedStudentIds = new Set<string>();

        for (const row of data) {
            const nim = row['NIM'];
            if (!nim) continue;

            const mahasiswa = await prisma.profile.findUnique({ where: { nim: String(nim) }, select: { userId: true } });
            if (!mahasiswa) {
                errors.push(`NIM ${nim} tidak ditemukan`);
                continue;
            }

            let hasUpdates = false;
            for (const [key, value] of Object.entries(row)) {
                if (headerToTeknikId.has(key)) {
                    const teknikId = headerToTeknikId.get(key)!;
                    const nilai = parseFloat(value as string);

                    if (!isNaN(nilai) && nilai >= 0 && nilai <= 100) {
                        await prisma.nilaiTeknikPenilaian.upsert({
                            where: {
                                mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                                    mahasiswaId: mahasiswa.userId,
                                    teknikPenilaianId: teknikId,
                                    semester,
                                    tahunAjaran
                                }
                            },
                            update: { nilai, updatedAt: new Date() },
                            create: {
                                mahasiswaId: mahasiswa.userId,
                                teknikPenilaianId: teknikId,
                                mataKuliahId,
                                nilai,
                                semester,
                                tahunAjaran,
                                createdBy: userId
                            }
                        });
                        successCount++;
                        hasUpdates = true;
                    }
                }
            }
            if (hasUpdates) processedStudentIds.add(mahasiswa.userId);
        }

        // Trigger updates
        for (const cpmk of cpmkList) {
            for (const mId of processedStudentIds) {
                await calculateNilaiCpmk(mId, cpmk.id, mataKuliahId, semester, tahunAjaran);
            }
        }

        return { successCount, errors };
    }
}
