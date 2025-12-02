// ============================================
// Express Server dengan Prisma + MySQL
// ============================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;
console.log('Environment:', process.env.NODE_ENV);

// Middleware
// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8081',
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow any localhost origin
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // For development, we might want to log blocked origins
    console.log('Blocked by CORS:', origin);
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server running',
    database: 'MySQL + Prisma',
    timestamp: new Date().toISOString()
  });
});

// Import routes
import authRoutes from './routes/auth.js';
import cplRoutes from './routes/cpl.js';
import cplMappingRoutes from './routes/cpl-mapping.js';
import mataKuliahRoutes from './routes/mata-kuliah.js';
import dashboardRoutes from './routes/dashboard.js';
import usersRoutes from './routes/users.js';
import nilaiCplRoutes from './routes/nilai-cpl.js';
import profileRoutes from './routes/profile.js';
import transkripCplRoutes from './routes/transkrip-cpl.js';
import transkripCpmkRoutes from './routes/transkrip-cpmk.js';
import cpmkRoutes from './routes/cpmk.js';
import cpmkMappingRoutes from './routes/cpmk-mapping.js';
import teknikPenilaianRoutes from './routes/teknik-penilaian.js';
import nilaiTeknikRoutes from './routes/nilai-teknik.js';
import settingsRoutes from './routes/settings.js';
import mataKuliahPengampuRoutes from './routes/mata-kuliah-pengampu.js';
import kaprodiDataRoutes from './routes/kaprodi-data.js';
import fakultasRoutes from './routes/fakultas.js';
import prodiRoutes from './routes/prodi.js';
import kurikulumRoutes from './routes/kurikulum.js';
import jenisMataKuliahRoutes from './routes/jenis-mata-kuliah.js';
import kategoriCplRoutes from './routes/kategori-cpl.js';
import levelTaksonomiRoutes from './routes/level-taksonomi.js';
import teknikPenilaianRefRoutes from './routes/teknik-penilaian-ref.js';
import referencesRoutes from './routes/references.js';
import rubrikRoutes from './routes/rubrik.js';
import evaluasiRoutes from './routes/evaluasi.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cpl', cplRoutes);
app.use('/api/cpl-mata-kuliah', cplMappingRoutes);
app.use('/api/mata-kuliah', mataKuliahRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/nilai-cpl', nilaiCplRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/transkrip-cpl', transkripCplRoutes);
app.use('/api/transkrip-cpmk', transkripCpmkRoutes);
app.use('/api/cpmk', cpmkRoutes);
app.use('/api/cpmk-mapping', cpmkMappingRoutes);
app.use('/api/teknik-penilaian', teknikPenilaianRoutes);
app.use('/api/nilai-teknik', nilaiTeknikRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/mata-kuliah-pengampu', mataKuliahPengampuRoutes);
app.use('/api/kaprodi-data', kaprodiDataRoutes);
app.use('/api/fakultas', fakultasRoutes);
app.use('/api/prodi', prodiRoutes);
app.use('/api/kurikulum', kurikulumRoutes);
app.use('/api/jenis-mata-kuliah', jenisMataKuliahRoutes);
app.use('/api/kategori-cpl', kategoriCplRoutes);
app.use('/api/level-taksonomi', levelTaksonomiRoutes);
app.use('/api/teknik-penilaian-ref', teknikPenilaianRefRoutes);
app.use('/api/references', referencesRoutes);
app.use('/api/rubrik', rubrikRoutes);
app.use('/api/evaluasi', evaluasiRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log('');
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('📊 Database: MySQL + Prisma');
  console.log('🎨 Frontend: ' + (process.env.CORS_ORIGIN || 'http://localhost:5173'));
  console.log('');
  console.log('API Endpoints:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  POST   /api/auth/logout');
  console.log('  GET    /api/cpl');
  console.log('  GET    /api/dashboard/stats');
  console.log('');
});

export default app;
