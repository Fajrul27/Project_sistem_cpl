// ============================================
// Express Server dengan Prisma + MySQL
// ============================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

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
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Debug: Log all requests
app.use((req, res, next) => {
  next();
});

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
import routes from './routes/index.js';
import auditLogRoutes from './routes/audit-log.js';

// API Routes
app.use('/api', routes);
app.use('/api/audit-logs', auditLogRoutes);

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
});

export default app;
