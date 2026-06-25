// src/modules/products/products.service.ts

import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { AppError } from '../../middleware/errorHandler';
import { paginate } from '../../types';
import { checkNotificationRulesForProduct } from '../notifications/notifications.service';

const CACHE_TTL = 300;
const PRODUCT_CACHE_SET = 'cache:product-keys';

type TransactionClient = any;

export interface ProductFilters {
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  era?: string;
  countryOfOrigin?: string;
  condition?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: string;
  limit?: string;
}

export class ProductsService {
  async getProducts(filters: ProductFilters) {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as { data: unknown[]; meta: object };

    const { skip, take, page, limit } = paginate(filters.page, filters.limit);

    const where: any = {
      isActive: true,
      hideFromMain: false,
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.era && { era: { contains: filters.era, mode: 'insensitive' } }),
      ...(filters.countryOfOrigin && {
        countryOfOrigin: { contains: filters.countryOfOrigin, mode: 'insensitive' },
      }),
      ...(filters.condition && { condition: filters.condition as any }),
  ...((filters.minPrice || filters.maxPrice) && {
        price: {
          ...(filters.minPrice && !isNaN(Number(filters.minPrice)) && Number(filters.minPrice) >= 0 && {
            gte: Number(filters.minPrice)
          }),
          ...(filters.maxPrice && !isNaN(Number(filters.maxPrice)) && Number(filters.maxPrice) >= 0 && {
            lte: Number(filters.maxPrice)
          }),
        },
      }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { era: { contains: filters.search, mode: 'insensitive' } },
          { countryOfOrigin: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: any = (() => {
      switch (filters.sort) {
        case 'price_asc':  return { price: 'asc' as const };
        case 'price_desc': return { price: 'desc' as const };
        case 'popular':    return { viewCount: 'desc' as const };
        default:           return { createdAt: 'desc' as const };
      }
    })();

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    const result = {
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
    await redis.sadd(PRODUCT_CACHE_SET, cacheKey);
    return result;
  }

  async getProductBySlug(slug: string, userId?: string, sessionId?: string) {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) throw new AppError('Product not found', 404);
    this.trackView(product.id, userId, sessionId).catch(() => {});
    return product;
  }

  async getFeaturedProducts(limit = 8) {
    const cacheKey = `featured:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as unknown[];

    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true, hideFromMain: false },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true, slug: true } } },
    });

    await redis.set(cacheKey, JSON.stringify(products), 'EX', CACHE_TTL);
    await redis.sadd('cache:featured-keys', cacheKey);
    return products;
  }

  async getRecommendations(userId?: string, sessionId?: string, limit = 8) {
    const views = await prisma.productView.findMany({
      where: {
        ...(userId ? { userId } : { sessionId }),
        viewedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { viewedAt: 'desc' },
      take: 20,
      select: { productId: true, product: { select: { categoryId: true } } },
    });

    if (views.length === 0) {
      return prisma.product.findMany({
        where: { isActive: true, hideFromMain: false },
        orderBy: { viewCount: 'desc' },
        take: limit,
        include: { category: { select: { name: true, slug: true } } },
      });
    }

    const categoryCounts: Record<string, number> = views.reduce((acc: Record<string,number>, v: any) => {
      const cid = v.product.categoryId;
      acc[cid] = (acc[cid] ?? 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => (Number(b)) - (Number(a)))
      .slice(0, 3)
      .map(([id]) => id);

    const viewedIds = views.map((v: any) => v.productId as string);

    return prisma.product.findMany({
      where: {
        isActive: true,
        hideFromMain: false,
        categoryId: { in: topCategories },
        id: { notIn: viewedIds },
      },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: { category: { select: { name: true, slug: true } } },
    });
  }

  private async trackView(productId: string, userId?: string, sessionId?: string) {
    await Promise.all([
      prisma.productView.create({ data: { productId, userId, sessionId } }),
      prisma.product.update({ where: { id: productId }, data: { viewCount: { increment: 1 } } }),
    ]);
  }

  async createProduct(data: any) {
    const product = await prisma.product.create({ data });
    await this.bustProductCache();
    checkNotificationRulesForProduct(product.id).catch(() => {});
    return product;
  }

  async updateProduct(id: string, data: any) {
    const product = await prisma.product.update({ where: { id }, data });
    await this.bustProductCache();
    return product;
  }

  async deleteProduct(id: string) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    await this.bustProductCache();
  }

  private async bustProductCache() {
    const productKeys = await redis.smembers(PRODUCT_CACHE_SET);
    const featuredKeys = await redis.smembers('cache:featured-keys');
    const allKeys = [...productKeys, ...featuredKeys];
    if (allKeys.length) await redis.unlink(...allKeys);
    await redis.del(PRODUCT_CACHE_SET, 'cache:featured-keys');
  }
}

export const productsService = new ProductsService();
