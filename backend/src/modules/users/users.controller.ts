// src/modules/users/users.controller.ts
import { Response, NextFunction } from 'express';
import { usersService, updateProfileSchema, changePasswordSchema } from './users.service';
import { AuthenticatedRequest } from '../../types';

export class UsersController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await usersService.getProfile(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = updateProfileSchema.parse(req.body);
      const data = await usersService.updateProfile(req.user!.id, parsed);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      await usersService.changePassword(req.user!.id, currentPassword, newPassword);
      res.json({ success: true, message: 'Пароль успешно изменён' });
    } catch (err) { next(err); }
  }

  async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await usersService.getOrderHistory(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await usersService.deleteAccount(req.user!.id);
      res.json({ success: true, message: 'Аккаунт удалён. Ваши данные удалены.' });
    } catch (err) { next(err); }
  }
}

export const usersController = new UsersController();
