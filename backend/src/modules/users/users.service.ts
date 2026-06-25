// src/modules/users/users.service.ts
// Без изменений в логике, добавлена проверка deletedAt при getProfile

import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { hashPassword, verifyPassword } from '../../utils/password';
import { AppError } from '../../middleware/errorHandler';
import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().max(20).trim().optional(),
  address: z.string().max(255).trim().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain a number'),
});

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        consentGivenAt: true,
        createdAt: true,
        // deletedAt НЕ включаем — не нужен клиенту
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async updateProfile(userId: string, data: z.infer<typeof updateProfileSchema>) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, phone: true, address: true },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Current password is incorrect', 400);

    // Запрещаем ставить тот же пароль
    const samePassword = await verifyPassword(newPassword, user.passwordHash);
    if (samePassword) throw new AppError('New password must be different from the current one', 400);

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  async getOrderHistory(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, slug: true } },
          },
        },
      },
    });
  }

  // GDPR: soft delete — анонимизируем личные данные
  async deleteAccount(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.invalid`,
        name: 'Deleted User',
        phone: null,
        address: null,
        passwordHash: 'DELETED',
        refreshTokenHash: null,
        deletedAt: new Date(),
      },
    });
  }
}

export const usersService = new UsersService();
