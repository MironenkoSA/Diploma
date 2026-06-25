// src/app.ts
// Дипломный проект — Ателье Историй Vintage Shop
import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { connectDB, disconnectDB } from './config/database';
import { sanitizeInput } from './middleware/sanitize';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import productsRoutes from './modules/products/products.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import ordersRoutes from './modules/orders/orders.routes';
import promotionsRoutes from './modules/promotions/promotions.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import eventsRoutes from './modules/events/events.routes';
import fairsRoutes from './modules/fairs/fairs.routes';
import settingsRoutes from './modules/settings/settings.routes';
import uploadRoutes from './modules/upload/upload.routes';
import { cancelExpiredRegistrations } from './modules/events/events.routes';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeInput);
app.use('/api', apiLimiter);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/fairs', fairsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);

// Отдаём загруженные файлы как статику
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

async function bootstrap() {
  await connectDB();
  // Каждые 15 минут проверяем просроченные брони
  setInterval(() => {
    cancelExpiredRegistrations();
  }, 15 * 60 * 1000);
  // Сразу при старте
  cancelExpiredRegistrations();

  const server = app.listen(config.PORT, () => {
    logger.info(`🚀 Ателье Историй API running on http://localhost:${config.PORT}`);
    logger.info(`   Environment: ${config.NODE_ENV}`);
  });
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down...`);
    server.close(async () => { await disconnectDB(); process.exit(0); });
    setTimeout(() => process.exit(1), 10_000);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch(err => { logger.error('Failed to start', err); process.exit(1); });
export default app;
