import { Router } from "express";
import { TahunAjaranController } from "../controllers/tahun-ajaran-controller.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
// GET / - List all (accessible to authenticated users, or maybe restricted further if needed)
router.get("/", TahunAjaranController.getAll);

// Export/Import
router.get("/export/excel", requireRole('admin'), TahunAjaranController.exportExcel);
router.get("/template/excel", requireRole('admin'), TahunAjaranController.getTemplate);
router.post("/import/excel", requireRole('admin'), upload.single('file'), TahunAjaranController.importExcel);

// POST / - Create (Admin only)
router.post("/", requireRole('admin'), TahunAjaranController.create);

// PUT /:id - Update (Admin only)
router.put("/:id", requireRole('admin'), TahunAjaranController.update);

// DELETE /:id - Delete (Admin only)
router.delete("/:id", requireRole('admin'), TahunAjaranController.delete);

export default router;
