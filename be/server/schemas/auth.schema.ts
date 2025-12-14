
import { z } from 'zod';

export const authSchemas = {
    login: z.object({
        email: z.string().email("Email tidak valid"),
        password: z.string().min(6, "Password minimal 6 karakter")
    }),

    register: z.object({
        email: z.string().email("Email tidak valid"),
        password: z.string().min(6, "Password minimal 6 karakter"),
        namaLengkap: z.string().min(3, "Nama lengkap wajib diisi"),
        role: z.enum(["admin", "dosen", "mahasiswa", "kaprodi", "dekan"]),
        nip: z.string().optional(),
        nim: z.string().optional()
    })
};
