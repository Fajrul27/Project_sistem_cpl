import { Request, Response } from "express";
import { TahunAjaranService } from "../services/TahunAjaranService.js";
import { z } from "zod";

const createSchema = z.object({
    nama: z.string().min(1, "Nama Tahun Ajaran wajib diisi"),
    isActive: z.boolean().optional()
});

const updateSchema = z.object({
    nama: z.string().optional(),
    isActive: z.boolean().optional()
});

export class TahunAjaranController {
    static async getAll(req: Request, res: Response) {
        try {
            const data = await TahunAjaranService.getAll();
            res.json(data);
        } catch (error) {
            console.error("Error fetching tahun ajaran:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const data = createSchema.parse(req.body);
            const result = await TahunAjaranService.create(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else {
                console.error("Error creating tahun ajaran:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = updateSchema.parse(req.body);
            const result = await TahunAjaranService.update(id, data);
            res.json(result);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else {
                console.error("Error updating tahun ajaran:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await TahunAjaranService.delete(id);
            res.json({ message: "Tahun Ajaran deleted successfully" });
        } catch (error) {
            console.error("Error deleting tahun ajaran:", error);
            // Handle Prisma foreign key constraint errors specifically if possible
            res.status(500).json({ error: "Gagal menghapus. Data mungkin sedang digunakan." });
        }
    }
}
