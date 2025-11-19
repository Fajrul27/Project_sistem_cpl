// ============================================
// Express Server dengan Prisma + MySQL
// ============================================

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
import authRoutes from './routes/auth';
import cplRoutes from './routes/cpl';
import cplMappingRoutes from './routes/cpl-mapping';
import mataKuliahRoutes from './routes/mata-kuliah';
import dashboardRoutes from './routes/dashboard';
import usersRoutes from './routes/users';
import nilaiCplRoutes from './routes/nilai-cpl';
import profileRoutes from './routes/profile';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cpl', cplRoutes);
app.use('/api/cpl-mata-kuliah', cplMappingRoutes);
app.use('/api/mata-kuliah', mataKuliahRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/nilai-cpl', nilaiCplRoutes);
app.use('/api/profiles', profileRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
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
