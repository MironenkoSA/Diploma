// src/modules/fairs/fairs.routes.ts
import { Router } from 'express';
import { prisma } from '../../config/database';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { adminOnly } from '../../middleware/adminOnly';
import { z } from 'zod';

const router = Router();

// Без .refine() — иначе .partial() недоступен
const fairSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().min(1).trim(),
  imageUrl: z.string().optional().or(z.literal('')).refine(v => !v || v.startsWith('/') || v.startsWith('http'), 'Неверный URL'),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isPublished: z.boolean().default(false),
});

const fairItemSchema = z.object({
  productId: z.string().uuid(),
  discountPct: z.number().int().min(0).max(90).optional(),
});

function validateDateRange(s: string, e: string) {
  return new Date(e) > new Date(s);
}

// ══ ADMIN ROUTES — перед /:id ══════════════════════════════

router.get('/admin/all', authenticate, adminOnly, async (_req, res, next) => {
  try {
    const fairs = await prisma.fair.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });
    res.json({ success: true, data: fairs });
  } catch (err) { next(err); }
});

router.get('/admin/products', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { search, categoryId, era, countryOfOrigin } = req.query as Record<string, string | undefined>;
    const where: Record<string, unknown> = { isForFair: true, isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (era) where.era = { contains: era, mode: 'insensitive' };
    if (countryOfOrigin) where.countryOfOrigin = { contains: countryOfOrigin, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const products = await prisma.product.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { name: 'asc' },
      take: 100,
    });
    res.json({ success: true, data: products });
  } catch (err) { next(err); }
});

router.post('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { items, ...fairData } = req.body;
    const input = fairSchema.parse(fairData);
    if (!validateDateRange(input.startsAt, input.endsAt)) {
      return res.status(400).json({ success: false, message: 'endsAt must be after startsAt' });
    }
    const validatedItems = items?.length ? z.array(fairItemSchema).parse(items) : [];
    const fair = await prisma.fair.create({
      data: {
        ...input,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        items: validatedItems.length ? {
          create: validatedItems.map((item: { productId: string; discountPct?: number }) => ({
            productId: item.productId,
            discountPct: item.discountPct ?? null,
          })),
        } : undefined,
      } as any,
      include: { items: true },
    });
    res.status(201).json({ success: true, data: fair });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { items: _items, ...fairData } = req.body;
    const input = fairSchema.partial().parse(fairData);
    if (input.startsAt && input.endsAt && !validateDateRange(input.startsAt, input.endsAt)) {
      return res.status(400).json({ success: false, message: 'endsAt must be after startsAt' });
    }
    const data: Record<string, unknown> = { ...input };
    if (input.startsAt) data.startsAt = new Date(input.startsAt);
    if (input.endsAt) data.endsAt = new Date(input.endsAt);
    const fair = await prisma.fair.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: fair });
  } catch (err) { next(err); }
});

router.put('/:id/items', authenticate, adminOnly, async (req, res, next) => {
  try {
    const items = z.array(fairItemSchema).parse(req.body.items ?? []);
    const productIds = items.map((i: { productId: string }) => i.productId);
    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isForFair: true },
        select: { id: true },
      });
      if (products.length !== productIds.length) {
        return res.status(400).json({ success: false, message: 'Some products are not marked for fairs' });
      }
    }
    await prisma.$transaction([
      prisma.fairItem.deleteMany({ where: { fairId: req.params.id } }),
      ...(productIds.length > 0 ? [prisma.fairItem.createMany({
        data: items.map((i: { productId: string; discountPct?: number }) => ({
          fairId: req.params.id,
          productId: i.productId,
          discountPct: i.discountPct ?? null,
        })),
      })] : []),
    ]);
    const updated = await prisma.fair.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } } },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    await prisma.fair.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Fair not found' });
    next(err);
  }
});

// ══ PUBLIC ROUTES — после admin ════════════════════════════

router.get('/', async (_req, res, next) => {
  try {
    const fairs = await prisma.fair.findMany({
      where: { isPublished: true },
      orderBy: { startsAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });
    res.json({ success: true, data: fairs });
  } catch (err) { next(err); }
});

router.get('/:id', optionalAuth, async (req: any, res, next) => {
  try {
    const fair = await prisma.fair.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: { include: { category: { select: { name: true, slug: true } } } },
          },
        },
        _count: { select: { items: true } },
      },
    });
    if (!fair) return res.status(404).json({ success: false, message: 'Fair not found' });
    if (!fair.isPublished && req.user?.role !== 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Fair not found' });
    }
    res.json({ success: true, data: fair });
  } catch (err) { next(err); }
});

export default router;
