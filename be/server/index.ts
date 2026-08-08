// ============================================
// Express Server dengan Prisma + MySQL
// ============================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8081',
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow any localhost or 127.0.0.1 origin
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Handle WAF blocking PUT and DELETE methods by allowing POST with X-HTTP-Method-Override
app.use((req: any, res: any, next: any) => {
  const override = req.headers['x-http-method-override'] || req.query?._method;
  if (req.method === 'POST' && override) {
    req.method = String(override).toUpperCase();
  }
  next();
});

// Debug: Log requests (Production: Log errors only for maximum I/O performance)
app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production' || res.statusCode >= 400) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// Health check
app.get('/health', async (req: any, res: any) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      message: 'Server and Database are running',
      database: 'MySQL + Prisma',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
const startServer = async () => {
  try {
    const server = app.listen(Number(PORT), '0.0.0.0', 4096, () => {
      const instanceId = process.env.NODE_APP_INSTANCE ?? 'Single-Threaded';
      console.log(`🚀 Server running on http://localhost:${PORT} (PID: ${process.pid}, PM2 Worker: ${instanceId})`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Database: MySQL + Prisma`);
      console.log(`🌐 Host: 0.0.0.0 (IPv4 Only)`);
    });

    // Configure extended timeouts to handle heavy queues without dropping HTTP connections
    server.keepAliveTimeout = 120000; // 120 detik
    server.headersTimeout = 125000;   // 125 detik (must be > keepAliveTimeout)
    server.requestTimeout = 300000;   // 300 detik (5 menit)

    // Database connection & master table cache warmup in background
    // Only PM2 worker #0 does the heavy warmup to prevent all 12 workers from
    // hitting the DB simultaneously on cold start (cache stampede prevention).
    const instanceId = parseInt(process.env.NODE_APP_INSTANCE || '0', 10);
    const isFirstWorker = instanceId === 0;

    setTimeout(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        await prisma.fakultas.findMany({ take: 5 }).catch(() => {});
        await prisma.prodi.findMany({ take: 5 }).catch(() => {});
        await prisma.kurikulum.findMany({ take: 5 }).catch(() => {});

        // Only worker 0 pre-warms the dashboard cache to avoid stampede
        if (isFirstWorker) {
          const { DashboardService } = await import('./services/DashboardService.js');
          // Pre-warm admin global dashboard (most expensive query).
          // userId='system-warmup' is fine: admin role skips getUserProfile() lookup.
          DashboardService.getDashboardStats({
            userId: 'system-warmup',
            userRole: 'admin',
            semester: undefined,
            angkatan: undefined,
            prodiId: undefined,
            fakultasId: undefined
          }).catch(() => {}); // Non-blocking, ignore errors silently
          console.log('[Warmup] Worker 0: Dashboard cache pre-warming started.');
        }
      } catch (err) {
        // Non-blocking warmup
      }
    }, isFirstWorker ? 500 : 2000); // Worker 0 warms up first, others wait for cache to be ready

    // Handle graceful shutdown
    const shutdown = () => {
      console.log('Signal received: closing HTTP server');
      server.close(async () => {
        console.log('HTTP server closed');
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
