// src/middleware/auth.ts
import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(authHeader.slice(7));
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // silently ignore — route works without auth too
    }
  }
  next();
}
