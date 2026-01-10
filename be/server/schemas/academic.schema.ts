
import { z } from 'zod';
import { commonSchema } from './common.schema.js';

export const academicSchemas = {
    // Fakultas
    fakultas: z.object({
        nama: z.string().min(1),
        kode: z.string().min(1)
    }),

    // Prodi
    prodi: z.object({
        nama: z.string().min(1),
        kode: z.string().optional(),
        jenjang: z.string().optional(),
        fakultasId: commonSchema.uuid
    }),

    // Mata Kuliah
    mataKuliah: z.object({
        kodeMk: z.string().min(1),
        namaMk: z.string().min(1),
        sks: z.coerce.number().int().positive(),
        semester: z.coerce.number().int().positive(),
        deskripsi: z.string().optional(),
        programStudi: z.string().optional(), // Legacy Support
        prodiId: commonSchema.uuid.nullable().optional(),
        jenisMkId: commonSchema.uuid.nullable().optional(),
        kurikulumId: commonSchema.uuid.nullable().optional(),
        semesterId: commonSchema.uuid.nullable().optional(),
        isActive: z.boolean().optional()
    }),

    // CPL
    cpl: z.object({
        kodeCpl: z.string().min(1),
        deskripsi: z.string().min(1),
        kategori: z.string().optional(), // Legacy
        kategoriId: commonSchema.uuid.nullable().optional(),
        prodiId: commonSchema.uuid.nullable().optional(),
        kurikulumId: commonSchema.uuid.nullable().optional(),
        isActive: z.boolean().optional()
    }),

    // CPMK
    cpmk: z.object({
        kodeCpmk: z.string().min(1),
        deskripsi: z.string().min(1),
        mataKuliahId: commonSchema.uuid,
        isActive: z.boolean().optional(),
        levelTaksonomi: z.string().optional(),
        levelTaksonomiId: commonSchema.uuid.optional(),
        cplIds: z.array(z.string()).optional() // For mappings
    }),

    // Sub-CPMK
    subCpmk: z.object({
        kode: z.string().min(1),
        deskripsi: z.string().min(1),
        bobot: z.number().min(0).max(100),
        cpmkId: commonSchema.uuid
    })
};
