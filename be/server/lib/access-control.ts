// ============================================
// Access Control Helper Functions
// ============================================

import { prisma } from './prisma.js';

export async function canAccessMataKuliah(userId: string, userRole: string, mataKuliahId: string): Promise<boolean> {
    // Admin can access everything
    if (userRole === 'admin') return true;

    // Get mata kuliah
    const mataKuliah = await prisma.mataKuliah.findUnique({
        where: { id: mataKuliahId },
        include: { pengampu: true }
    });

    if (!mataKuliah) return false;

    // Dosen can access if they are pengampu
    if (userRole === 'dosen') {
        return mataKuliah.pengampu.some(p => p.dosenId === userId);
    }

    // Kaprodi can access if program studi matches
    if (userRole === 'kaprodi') {
        const profile = await prisma.profile.findUnique({
            where: { userId }
        });
        return profile?.programStudi === mataKuliah.programStudi;
    }

    return false;
}

export async function canAccessCpmk(userId: string, userRole: string, cpmkId: string): Promise<boolean> {
    // Admin can access everything
    if (userRole === 'admin') return true;

    // Get CPMK with mata kuliah
    const cpmk = await prisma.cpmk.findUnique({
        where: { id: cpmkId },
        include: {
            mataKuliah: {
                include: { pengampu: true }
            }
        }
    });

    if (!cpmk) return false;

    return canAccessMataKuliah(userId, userRole, cpmk.mataKuliahId);
}

export async function canAccessCpl(userId: string, userRole: string, cplId: string): Promise<boolean> {
    // Admin can access everything
    if (userRole === 'admin') return true;

    const cpl = await prisma.cpl.findUnique({
        where: { id: cplId },
        include: { prodi: true }
    });

    if (!cpl) return false;

    // Kaprodi can access CPL in their program studi
    if (userRole === 'kaprodi') {
        const profile = await prisma.profile.findUnique({
            where: { userId }
        });

        // Jika CPL memiliki prodiId, cek apakah cocok
        if (cpl.prodiId) {
            return cpl.prodiId === profile?.prodiId;
        }

        // Fallback: cek via mata kuliah (untuk CPL lama tanpa prodiId)
        const mappings = await prisma.cplMataKuliah.findMany({
            where: {
                cplId,
                mataKuliah: {
                    programStudi: profile?.programStudi
                }
            }
        });

        return mappings.length > 0;
    }

    // Dosen can access CPL if mapped to their mata kuliah
    if (userRole === 'dosen') {
        const assignments = await prisma.mataKuliahPengampu.findMany({
            where: { dosenId: userId },
            include: {
                mataKuliah: {
                    include: {
                        cpl: true
                    }
                }
            }
        });

        return assignments.some(a =>
            a.mataKuliah.cpl.some(mapping => mapping.cplId === cplId)
        );
    }

    return false;
}

export async function getAccessibleMataKuliahIds(userId: string, userRole: string): Promise<string[]> {
    // Admin can access all
    if (userRole === 'admin') {
        const all = await prisma.mataKuliah.findMany({ select: { id: true } });
        return all.map(m => m.id);
    }

    // Dosen: only assigned mata kuliah
    if (userRole === 'dosen') {
        const assignments = await prisma.mataKuliahPengampu.findMany({
            where: { dosenId: userId },
            select: { mataKuliahId: true }
        });
        return assignments.map(a => a.mataKuliahId);
    }

    // Kaprodi: mata kuliah in their program studi
    if (userRole === 'kaprodi') {
        const profile = await prisma.profile.findUnique({
            where: { userId }
        });

        const mataKuliah = await prisma.mataKuliah.findMany({
            where: { programStudi: profile?.programStudi },
            select: { id: true }
        });
        return mataKuliah.map(m => m.id);
    }

    return [];
}
