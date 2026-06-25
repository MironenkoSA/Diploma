// src/config/redis.ts
import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

export const redis = new Redis(config.REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 100, 3000),
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => logger.info('✅ Redis connected'));
redis.on('error', (err) => logger.error('❌ Redis error', err));
