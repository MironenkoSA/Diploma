// src/modules/orders/orders.service.ts

import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { sendOrderConfirmationToAdmin, sendOrderConfirmationToCustomer } from './email.service';
import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(50),
  shippingAddress: z.string().min(5).max(255).trim(),
  shippingCity: z.string().min(2).max(100).trim(),
  shippingCountry: z.string().min(2).max(100).trim(),
  shippingZip: z.string().min(3).max(20).trim(),
  notes: z.string().max(500).trim().optional(),
});

const orderStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export class OrdersService {
  async createOrder(userId: string, input: CreateOrderInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (!user) throw new AppError('User not found', 404);

    // Дедупликация productId
    const productIdSet = new Set(input.items.map((i) => i.productId));
    if (productIdSet.size !== input.items.length) {
      throw new AppError('Duplicate products in order. Combine quantities instead.', 400);
    }

    // Всё внутри транзакции — исключает race condition на стоке
    const order = await prisma.$transaction(async (tx: any) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...productIdSet] }, isActive: true },
      });

      if (products.length !== productIdSet.size) {
        throw new AppError('One or more products are unavailable', 400);
      }

      const priceMap = Object.fromEntries(products.map((p: any) => [p.id, p.price]));

      for (const item of input.items) {
        const product = products.find((p: any) => p.id === item.productId)!;
        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for "${product.name}"`, 400);
        }
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new AppError(`"${product.name}" just sold out`, 409);
        }
      }

      const totalAmount = input.items.reduce((sum, item) => {
        return sum + Number(priceMap[item.productId]) * item.quantity;
      }, 0);

      return tx.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingCountry: input.shippingCountry,
          shippingZip: input.shippingZip,
          notes: input.notes,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: priceMap[item.productId],
            })),
          },
        },
        include: {
          items: { include: { product: { select: { name: true } } } },
        },
      });
    });

    const emailData = {
      orderId: order.id,
      customerName: user.name,
      customerEmail: user.email,
      items: order.items.map((i: any) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: Number(i.priceAtTime).toFixed(2),
      })),
      total: Number(order.totalAmount).toFixed(2),
      shippingAddress: `${input.shippingAddress}, ${input.shippingCity}, ${input.shippingCountry}`,
    };

    Promise.all([
      sendOrderConfirmationToAdmin(emailData),
      sendOrderConfirmationToCustomer(emailData),
    ]).catch(() => {});

    return order;
  }

  async getOrderById(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, images: true, slug: true } } },
        },
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) throw new AppError('Order not found', 404);
    if (userId && order.userId !== userId) throw new AppError('Forbidden', 403);
    return order;
  }

  async getAllOrders(page = 1, limit = 20, status?: string) {
    if (status) {
      const parsed = orderStatusSchema.safeParse(status);
      if (!parsed.success) throw new AppError('Invalid order status', 400);
    }
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, totalPages: Math.ceil(total / limit) };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const parsed = orderStatusSchema.safeParse(status);
    if (!parsed.success) {
      throw new AppError(`Invalid status. Must be one of: ${orderStatusSchema.options.join(', ')}`, 400);
    }
    return prisma.order.update({
      where: { id: orderId },
      data: { status: parsed.data },
    });
  }
}

export const ordersService = new OrdersService();
