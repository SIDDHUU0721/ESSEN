import express, { Application, Request, Response } from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { connectDB } from './config/db';
import { initSocket } from './config/socket';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import apiRouter from './routes';
import { Restaurant } from './models/Restaurant';
import { seedDatabase } from './config/seed';

const app: Application = express();
const server = http.createServer(app);

// 1. Initialize Real-Time WebSockets
initSocket(server);

// 2. Core Security & Utility Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Serve static dish images
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// 3. Health & Status Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    platform: 'ESSEN AI-Powered Unified Restaurant Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'MongoDB',
    realtime: 'Socket.IO',
    cache: 'Redis/In-Memory',
  });
});

// 4. API Docs Specification (Swagger Minimal Viewer)
const swaggerDoc = {
  openapi: '3.0.0',
  info: {
    title: 'ESSEN Unified Restaurant Platform API',
    version: '1.0.0',
    description: 'Complete REST API specification for AI Restaurant Discovery, Dine-In QR, KDS, Delivery, and ESSEN Loyalty Coins.',
  },
  servers: [{ url: `http://localhost:${config.port}/api`, description: 'Development Server' }],
  paths: {
    '/auth/login': { post: { summary: 'Customer/Staff Login' } },
    '/auth/manager-login': { post: { summary: 'Manager Code Verification Login' } },
    '/restaurants': { get: { summary: 'Discover & Filter Restaurants' } },
    '/orders': { post: { summary: 'Place Order with Server-Side Pricing' } },
    '/rewards/hub': { get: { summary: 'Customer Loyalty Hub & Restaurant Coin Balances' } },
    '/rewards/claim-voucher': { post: { summary: 'Claim Transaction-linked QR Voucher (+5 to +10 coins)' } },
    '/rewards/unlock-combo': { post: { summary: 'Unlock 5,000 Coins Free Combo Milestone' } },
    '/essen/query': { post: { summary: 'ESSEN AI Natural Language Query & Intent Execution' } },
  },
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// 5. Mount API Routes with Rate Limiting
app.use('/api', apiRateLimiter, apiRouter);

// 6. Centralized Error Handler
app.use(errorHandler);

// 7. Start Server Listener
const startServer = async () => {
  await connectDB();
  try {
    const count = await Restaurant.countDocuments();
    if (count === 0) {
      console.log('⚡ [Auto-Seed] No restaurants found. Seeding sample restaurants and accounts...');
      await seedDatabase(false);
    }
  } catch (err) {
    console.warn('[Auto-Seed] Skipping automatic seed:', err);
  }
  server.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ESSEN Server running at http://localhost:${config.port}`);
    console.log(`📑 API Documentation at http://localhost:${config.port}/api/docs`);
    console.log(`⚡ WebSocket Server initialized for live KDS & Tracking`);
    console.log(`=======================================================`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, server };
