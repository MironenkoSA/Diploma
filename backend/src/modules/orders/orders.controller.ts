// src/modules/orders/orders.controller.ts
import { Response, NextFunction } from 'express';
import { ordersService, createOrderSchema } from './orders.service';
import { ZodError } from 'zod';
import { AuthenticatedRequest } from '../../types';

export class OrdersController {
  async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createOrderSchema.parse(req.body);
      const data = await ordersService.createOrder(req.user!.id, input);
      res.status(201).json({ success: true, data });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldMap: Record<string, string> = {
          shippingAddress: 'адрес доставки',
          shippingCity: 'город',
          shippingCountry: 'страна',
          shippingZip: 'почтовый индекс',
          items: 'состав заказа',
        };
        const first = err.errors[0];
        const field = fieldMap[first.path[0]] || first.path[0];
        return res.status(422).json({ success: false, message: `Заполните поле: ${field}` });
      }
      next(err);
    }
  }

  async getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ordersService.getOrderById(req.params.id, req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  // Admin
  async getAllOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const data = await ordersService.getAllOrders(page, limit, status);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ordersService.updateOrderStatus(req.params.id, req.body.status);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

export const ordersController = new OrdersController();
