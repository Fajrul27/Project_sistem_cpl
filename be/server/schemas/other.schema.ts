
import { z } from 'zod';
import { commonSchema } from './common.schema.js';

export const otherSchemas = {
    // Profil Lulusan (Graduate Profile)
    profilLulusan: z.object({
        kode: z.string().min(1),
        nama: z.string().min(1),
        deskripsi: z.string().optional(),
        prodiId: commonSchema.uuid,
        isActive: z.boolean().optional(),
        cplIds: z.array(commonSchema.uuid).optional()
    }),

    // Visi Misi
    visiMisi: z.object({
        teks: z.string().min(1),
        tipe: z.enum(['visi', 'misi']),
        urutan: z.coerce.number().int().positive(),
        prodiId: commonSchema.uuid,
        isActive: z.boolean().optional()
    }),

    // Settings (Key-Value updates)
    settingsUpdate: z.record(z.string(), z.any()),

    // Nilai CPL (Direct CPL Grade)
    nilaiCpl: z.object({
        mahasiswaId: commonSchema.uuid,
        cplId: commonSchema.uuid,
        mataKuliahId: commonSchema.uuid,
        nilai: z.coerce.number().min(0).max(100),
        semester: z.coerce.number().int().positive(),
        tahunAjaran: z.string().optional()
    })
};
