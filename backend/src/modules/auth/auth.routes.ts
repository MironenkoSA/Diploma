// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from './auth.schema';

const router = Router();

// POST /api/auth/register
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// POST /api/auth/refresh
router.post('/refresh', validate(refreshSchema), authController.refresh);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/me
router.get('/me', authenticate, authController.me);

// Верификация email
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authenticate, authController.resendVerification);

export default router;
