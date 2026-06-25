// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';
import { config } from '../config';

// Фабрика — создаёт совместимый sendCommand
function makeRedisStore(prefix: string) {
  return new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: ((...args: string[]) => (redis as any).call(...args)) as any,
    prefix,
  });
}

export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore('rl:api:'),
  handler: (_req, res) => {
    res.status(429).json({ success: false, message: 'Too many requests, please try again later.' });
  },
});

export const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeRedisStore('rl:auth:'),
  handler: (_req, res) => {
    res.status(429).json({ success: false, message: 'Too many login attempts. Please wait 15 minutes.' });
  },
});
