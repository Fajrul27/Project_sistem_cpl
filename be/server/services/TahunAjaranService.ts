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
            if (data.isActive) {
                // If setting as active, deactivate all others
                await tx.tahunAjaran.updateMany({
                    where: { id: { not: id }, isActive: true },
                    data: { isActive: false }
                });
            }
            return tx.tahunAjaran.update({
                where: { id },
                data
            });
        });
    }

    static async delete(id: string) {
        // Check for dependencies before delete
        // This is simplified; foreign key constraints will likely block deletion naturally,
        // but we can add explicit checks if needed for better error messages.
        return prisma.tahunAjaran.delete({
            where: { id }
        });
    }
}
