
import { z } from 'zod';

export const commonSchema = {
    uuid: z.string().uuid("ID tidak valid"),
    positiveInt: z.number().int().positive(),
    nonEmptyString: z.string().min(1, "Wajib diisi"),
    pagination: z.object({
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
        search: z.string().optional()
    })
};
