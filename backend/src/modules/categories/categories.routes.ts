// src/modules/categories/categories.routes.ts
import { Router } from 'express';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/adminOnly';
import { z } from 'zod';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  slug: z.string().min(1).max(100).toLowerCase().trim(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
});

router.get('/', async (_req, res, next) => {
  try {
    const data = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const data = await prisma.category.findUnique({ where: { slug: req.params.slug } });
    if (!data) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const input = categorySchema.parse(req.body);
    const data = await prisma.category.create({ data: input });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const input = categorySchema.partial().parse(req.body);
    const data = await prisma.category.update({ where: { id: req.params.id }, data: input });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
