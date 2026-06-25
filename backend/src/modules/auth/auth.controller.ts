// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  verifyEmail,
  resendVerification,
} from './auth.service';
import { AuthenticatedRequest } from '../../types';

export class AuthController {

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await registerUser(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await loginUser(req.body.email, req.body.password);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await refreshTokens(req.body.refreshToken);
      res.json({ success: true, data: tokens });
    } catch (err) { next(err); }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body.refreshToken) await logoutUser(req.body.refreshToken);
      res.json({ success: true, message: 'Выход выполнен' });
    } catch (err) { next(err); }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { prisma } = await import('../../config/database');
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true, email: true, name: true,
          phone: true, address: true, role: true,
          emailVerified: true, createdAt: true,
        },
      });
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token: string };
      if (!token) return res.status(400).json({ success: false, message: 'Токен не указан' });
      await verifyEmail(token);
      res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=success`);
    } catch (err: any) {
      res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=error&message=${encodeURIComponent(err.message)}`);
    }
  }

  async resendVerification(req: any, res: Response, next: NextFunction) {
    try {
      const result = await resendVerification(req.user.id);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }
}

export const authController = new AuthController();
export default authController;
