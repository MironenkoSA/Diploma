// src/config/database.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected via Prisma');
  } catch (err) {
    logger.error('❌ Database connection failed', err);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await prisma.$disconnect();
}
