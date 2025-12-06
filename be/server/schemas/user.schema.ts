
import { z } from 'zod';
import { commonSchema } from './common.schema.js';

export const userSchemas = {
    create: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(['admin', 'dosen', 'mahasiswa', 'kaprodi', 'dekan']),
        isActive: z.boolean().optional(),
        profile: z.object({
            namaLengkap: z.string().min(1),
            nim: z.string().optional(),
            nip: z.string().optional(),
            nidn: z.string().optional(),
            programStudi: z.string().optional(),
            semester: z.number().optional(),
            tahunMasuk: z.number().optional(),
            fakultasId: commonSchema.uuid.optional(),
            prodiId: commonSchema.uuid.optional(),
            // References
            semesterId: commonSchema.uuid.optional(),
            kelasId: commonSchema.uuid.optional(),
            angkatanId: commonSchema.uuid.optional()
        }).optional()
    }),

    update: z.object({
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        role: z.enum(['admin', 'dosen', 'mahasiswa', 'kaprodi', 'dekan']).optional(),
        isActive: z.boolean().optional(),
        profile: z.object({
            namaLengkap: z.string().optional(),
            nim: z.string().optional(),
            nip: z.string().optional(),
            nidn: z.string().optional(),
            programStudi: z.string().optional(),
            semester: z.number().optional(),
            tahunMasuk: z.number().optional(),
            fakultasId: commonSchema.uuid.optional(),
            prodiId: commonSchema.uuid.optional(),
            semesterId: commonSchema.uuid.optional(),
            kelasId: commonSchema.uuid.optional(),
            angkatanId: commonSchema.uuid.optional()
        }).optional()
    })
};
