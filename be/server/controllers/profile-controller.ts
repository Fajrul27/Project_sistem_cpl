
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// Update profile
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const {
            namaLengkap,
            nim,
            nip,
            programStudi,
            semester,
            tahunMasuk,
            alamat,
            noTelepon,
            prodiId,
            fakultasId,
            semesterId,
            kelasId,
            angkatanId
        } = req.body;

        // Check if profile belongs to current user or user is admin
        const profile = await prisma.profile.findUnique({
            where: { id },
            include: { user: { include: { role: true } } }
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile tidak ditemukan' });
        }

        const currentUserRole = (req as any).userRole;
        if (profile.userId !== userId && currentUserRole !== 'admin') {
            return res.status(403).json({ error: 'Tidak memiliki akses untuk mengupdate profile ini' });
        }

        // Prepare update data - only include fields that are provided
        const updateData: any = {};
        
        if (namaLengkap !== undefined) updateData.namaLengkap = namaLengkap || null;
        if (nim !== undefined) updateData.nim = nim || null;
        if (nip !== undefined) updateData.nip = nip || null;
        if (programStudi !== undefined) updateData.programStudi = programStudi || null;
        if (tahunMasuk !== undefined) updateData.tahunMasuk = tahunMasuk ? parseInt(tahunMasuk) : null;
        if (alamat !== undefined) updateData.alamat = alamat || null;
        if (noTelepon !== undefined) updateData.noTelepon = noTelepon || null;
        if (prodiId !== undefined) updateData.prodiId = prodiId || null;
        if (fakultasId !== undefined) updateData.fakultasId = fakultasId || null;
        if (semesterId !== undefined) updateData.semesterId = semesterId || null;
        if (kelasId !== undefined) updateData.kelasId = kelasId || null;
        if (angkatanId !== undefined) updateData.angkatanId = angkatanId || null;

        // Handle semester logic
        if (semesterId !== undefined) {
            if (semesterId) {
                const semesterRef = await prisma.semester.findUnique({
                    where: { id: semesterId }
                });
                if (semesterRef) {
                    updateData.semester = semesterRef.angka;
                }
            } else {
                updateData.semester = null;
                updateData.semesterId = null;
            }
        } else if (semester !== undefined) {
            // Fallback: if only semester int is provided, try to find matching semesterId
            if (semester) {
                updateData.semester = parseInt(semester);
                const semesterRef = await prisma.semester.findUnique({
                    where: { angka: parseInt(semester) }
                });
                if (semesterRef) {
                    updateData.semesterId = semesterRef.id;
                }
            } else {
                updateData.semester = null;
                updateData.semesterId = null;
            }
        }

        // Only update if there are fields to update
        if (Object.keys(updateData).length === 0) {
            return res.json({
                data: profile,
                message: 'Tidak ada perubahan untuk disimpan'
            });
        }

        // Update profile
        const updatedProfile = await prisma.profile.update({
            where: { id },
            data: updateData,
            include: {
                prodi: {
                    include: {
                        fakultas: true
                    }
                },
                kelasRef: true,
                semesterRef: true,
                angkatanRef: true
            }
        });

        console.log('Profile updated:', { id, updatedFields: Object.keys(updateData), newData: updatedProfile });

        res.json({
            data: updatedProfile,
            message: 'Profile berhasil diperbarui'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Gagal memperbarui profile' });
    }
};

// Get profile by ID
export const getProfileById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const profile = await prisma.profile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                },
                prodi: {
                    include: {
                        fakultas: true
                    }
                },
                semesterRef: true,
                kelasRef: true,
                angkatanRef: true
            }
        });

        if (!profile) {
            return res.status(404).json({ error: 'Profile tidak ditemukan' });
        }

        res.json({ data: profile });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Gagal mengambil data profile' });
    }
};
