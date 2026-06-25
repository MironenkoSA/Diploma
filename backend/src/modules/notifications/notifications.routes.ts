// src/modules/notifications/notifications.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../types';

const router = Router();
router.use(authenticate);

const ruleSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  isActive: z.boolean().default(true),
  categoryId: z.string().uuid().optional(),
  countryOfOrigin: z.string().max(100).trim().optional(),
  eraFrom: z.string().max(20).trim().optional(),
  eraTo: z.string().max(20).trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  keyword: z.string().max(100).trim().optional(),
  notifyByEmail: z.boolean().default(true),
  notifyInApp: z.boolean().default(true),
});

// Разделяем базовую схему и валидацию диапазона цен
function validatePriceRange(min?: number, max?: number): boolean {
  if (min !== undefined && max !== undefined) return min <= max;
  return true;
}

router.get('/rules', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rules = await prisma.notificationRule.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { notifications: true } } },
    });
    res.json({ success: true, data: rules });
  } catch (err) { next(err); }
});

router.post('/rules', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const input = ruleSchema.parse(req.body);
    if (!validatePriceRange(input.minPrice, input.maxPrice)) {
      return res.status(422).json({ success: false, message: 'minPrice must be ≤ maxPrice' });
    }
    const rule = await prisma.notificationRule.create({
      data: { ...input, userId: req.user!.id } as any,
    });
    res.status(201).json({ success: true, data: rule });
  } catch (err) { next(err); }
});

router.patch('/rules/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const input = ruleSchema.partial().parse(req.body);
    const rule = await prisma.notificationRule.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found' });
    const updated = await prisma.notificationRule.update({
      where: { id: req.params.id },
      data: input as any,
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.delete('/rules/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rule = await prisma.notificationRule.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found' });
    await prisma.notificationRule.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: req.user!.id } }),
      prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
    ]);

    res.json({
      success: true,
      data: notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), unread },
    });
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/read-all', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
