// src/middleware/adminOnly.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export function adminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  next();
}
