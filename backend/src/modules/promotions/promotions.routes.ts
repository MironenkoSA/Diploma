// src/modules/promotions/promotions.routes.ts
import { Router } from 'express';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/adminOnly';
import { z } from 'zod';

const router = Router();

const promoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  imageUrl: z.string().optional().refine(v => !v || v.startsWith('/') || v.startsWith('http'), 'Неверный URL'),
  linkUrl: z.string().optional().refine(v => !v || v.startsWith('/') || v.startsWith('http'), 'Неверный URL'),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  sortOrder: z.number().int().default(0),
});

// GET /api/promotions — active promos (public)
router.get('/', async (_req, res, next) => {
  try {
    const now = new Date();
    const data = await prisma.promotion.findMany({
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// Admin CRUD
router.get('/all', authenticate, adminOnly, async (_req, res, next) => {
  try {
    const data = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const input = promoSchema.parse(req.body);
    if (new Date(input.endsAt) <= new Date(input.startsAt)) {
      return res.status(400).json({ success: false, message: 'Дата окончания должна быть позже даты начала' });
    }
    const data = await prisma.promotion.create({
      data: { ...input, startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt) },
    });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const input = promoSchema.partial().parse(req.body);
    const data = await prisma.promotion.update({ where: { id: req.params.id }, data: input as any });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    await prisma.promotion.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
