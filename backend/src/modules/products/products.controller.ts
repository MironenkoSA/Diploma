// src/modules/products/products.controller.ts
// ИСПРАВЛЕНО: BUG-11 (валидация req.body при create/update через Zod)

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { productsService } from './products.service';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/errorHandler';

// FIX BUG-11: Строгая схема для создания/обновления товара
const productCreateSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  slug: z.string()
    .min(1).max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens only')
    .trim(),
  description: z.string().min(1).max(5000).trim(),
  price: z.coerce.number().min(0.01).max(999999),
  stock: z.coerce.number().int().min(0).max(9999),
  images: z.array(
    z.string()
      .refine(
        (s) => {
          try { new URL(s); return true; } catch {}
          return /^\/(images|uploads|static)\//.test(s) || /^data:image\/(jpeg|png|webp|gif|svg\+xml);base64,/.test(s);
        },
        { message: 'Должен быть URL или путь /images/...' }
      )
  ).max(10).default([]),
  era: z.string().max(20).trim().optional(),
  yearManufactured: z.coerce.number().int().min(1000).max(new Date().getFullYear()).optional(),
  countryOfOrigin: z.string().max(100).trim().optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).default('GOOD'),
  categoryId: z.string().uuid(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isForFair: z.boolean().default(false),
  hideFromMain: z.boolean().default(false),
});

const productUpdateSchema = productCreateSchema.partial();

export class ProductsController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productsService.getProducts(req.query as any);
      res.json({ success: true, ...result });
    } catch (err) { next(err); }
  }

  async getProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const data = await productsService.getProductBySlug(
        req.params.slug,
        req.user?.id,
        sessionId
      );
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getCountries(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await (await import('../../config/database')).prisma.product.findMany({
        where: { isActive: true, countryOfOrigin: { not: null } },
        select: { countryOfOrigin: true },
        distinct: ['countryOfOrigin'],
        orderBy: { countryOfOrigin: 'asc' },
      });
      const countries = products
        .map((p: any) => p.countryOfOrigin)
        .filter(Boolean)
        .sort();
      res.json({ success: true, data: countries });
    } catch (err) { next(err); }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 8, 50);
      const data = await productsService.getFeaturedProducts(limit);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async getRecommendations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const data = await productsService.getRecommendations(req.user?.id, sessionId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  // FIX BUG-11: Валидируем body перед передачей в сервис
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = productCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      // hideFromMain может быть true только если isForFair = true
      if (parsed.data.hideFromMain && !parsed.data.isForFair) {
        return res.status(422).json({
          success: false,
          message: 'hideFromMain can only be set when isForFair is true',
        });
      }
      const data = await productsService.createProduct(parsed.data as any);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = productUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      if (parsed.data.hideFromMain && parsed.data.isForFair === false) {
        return res.status(422).json({
          success: false,
          message: 'hideFromMain can only be set when isForFair is true',
        });
      }
      const data = await productsService.updateProduct(req.params.id, parsed.data as any);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await productsService.deleteProduct(req.params.id);
      res.json({ success: true, message: 'Product deactivated' });
    } catch (err) { next(err); }
  }
}

export const productsController = new ProductsController();
