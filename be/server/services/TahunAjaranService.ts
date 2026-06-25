import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export class TahunAjaranService {
    static async getAll() {
        return prisma.tahunAjaran.findMany({
            orderBy: { nama: 'desc' }
        });
    }

    static async getActive() {
        return prisma.tahunAjaran.findFirst({
            where: { isActive: true }
        });
    }

    static async create(data: { nama: string; isActive?: boolean }) {
        return prisma.$transaction(async (tx) => {
            if (data.isActive) {
                // If setting as active, deactivate all others
                await tx.tahunAjaran.updateMany({
                    where: { isActive: true },
                    data: { isActive: false }
                });
            }
            return tx.tahunAjaran.create({ data });
        });
    }

    static async update(id: string, data: { nama?: string; isActive?: boolean }) {
        return prisma.$transaction(async (tx) => {
            if (data.isActive === true) {
                // If setting as active, deactivate all others
                await tx.tahunAjaran.updateMany({
                    where: { id: { not: id }, isActive: true },
                    data: { isActive: false }
                });
            } else if (data.isActive === false) {
                // If trying to deactivate, check if it's the currently active one
                const current = await tx.tahunAjaran.findUnique({ where: { id } });
                if (current?.isActive) {
                    throw new Error("Tidak dapat menonaktifkan tahun ajaran yang sedang aktif. Silakan aktifkan tahun ajaran lain penggantinya.");
                }
            }

            return tx.tahunAjaran.update({
                where: { id },
                data
            });
        });
    }

    static async delete(id: string) {
        const tahunAjaran = await prisma.tahunAjaran.findUnique({
            where: { id }
        });

        if (!tahunAjaran) {
            throw new Error("Tahun Ajaran tidak ditemukan");
        }

        if (tahunAjaran.isActive) {
            throw new Error("Tidak dapat menghapus Tahun Ajaran yang sedang aktif. Silakan aktifkan tahun ajaran lain terlebih dahulu.");
        }

        const krsCount = await prisma.krs.count({ where: { tahunAjaranId: id } });
        const nilaiCplCount = await prisma.nilaiCpl.count({ where: { tahunAjaranId: id } });
        const nilaiCpmkCount = await prisma.nilaiCpmk.count({ where: { tahunAjaranId: id } });
        const evalCount = await prisma.evaluasiMataKuliah.count({ where: { tahunAjaranId: id } });

        if (krsCount > 0 || nilaiCplCount > 0 || nilaiCpmkCount > 0 || evalCount > 0) {
            const parts = [];
            if (krsCount > 0) parts.push(`${krsCount} KRS`);
            if (nilaiCplCount > 0 || nilaiCpmkCount > 0) parts.push(`${nilaiCplCount + nilaiCpmkCount} Nilai Mahasiswa`);
            if (evalCount > 0) parts.push(`${evalCount} Evaluasi Mata Kuliah`);
            throw new Error(`Data Tahun Ajaran tidak bisa dihapus karena masih terhubung dengan ${parts.join(', ')}.`);
        }

        return prisma.tahunAjaran.delete({
            where: { id }
        });
    }
}
