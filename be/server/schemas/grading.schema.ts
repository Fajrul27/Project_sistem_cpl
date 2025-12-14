
import { z } from 'zod';
import { commonSchema } from './common.schema.js';

export const gradingSchemas = {
    // Teknik Penilaian
    teknikPenilaian: z.object({
        namaTeknik: z.string().min(1),
        bobotPersentase: z.coerce.number().min(0).max(100),
        cpmkId: commonSchema.uuid,
        teknikRefId: commonSchema.uuid.optional(),
        deskripsi: z.string().optional()
    }),

    // Rubrik
    rubrik: z.object({
        cpmkId: commonSchema.uuid,
        deskripsi: z.string().optional(),
        isActive: z.boolean().optional(),
        kriteria: z.array(z.object({
            deskripsi: z.string().min(1),
            bobot: z.coerce.number().positive(),
            levels: z.array(z.object({
                deskripsi: z.string().min(1),
                nilai: z.coerce.number().min(0).max(100),
                label: z.string().optional()
            }))
        })).optional()
    }),

    // Nilai Input (Batch)
    nilaiBatch: z.object({
        kelasId: commonSchema.uuid.optional(), // Optional context
        mahasiswa: z.array(z.object({
            nim: z.string(),
            nilai: z.coerce.number().min(0).max(100)
        }))
    }),

    // Kuesioner
    kuesioner: z.object({
        semester: z.coerce.number(),
        tahunAjaran: z.string(),
        nilai: z.array(z.object({
            cplId: commonSchema.uuid,
            nilai: z.coerce.number().min(0).max(100)
        }))
    }),


    // Nilai Single Input
    nilaiSingle: z.object({
        mahasiswaId: commonSchema.uuid,
        teknikPenilaianId: commonSchema.uuid,
        mataKuliahId: commonSchema.uuid,
        nilai: z.coerce.number().min(0).max(100),
        semester: z.coerce.number().positive(),
        tahunAjaran: z.string().min(1),
        catatan: z.string().optional(),
        rubrikData: z.array(z.object({
            rubrikLevelId: commonSchema.uuid
        })).optional()
    }),

    // Evaluasi Dosen
    evaluasi: z.object({
        mataKuliahId: commonSchema.uuid,
        semester: z.coerce.number().positive(),
        tahunAjaran: z.string().min(1),
        kendala: z.string().optional(),
        rencanaPerbaikan: z.string().min(1)
    })
};
