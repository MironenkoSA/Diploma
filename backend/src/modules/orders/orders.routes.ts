// src/modules/orders/orders.routes.ts
import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/adminOnly';

const router = Router();

router.use(authenticate);

// User routes
router.post('/', ordersController.createOrder);
router.get('/:id', ordersController.getOrder);

// Admin routes
router.get('/', adminOnly, ordersController.getAllOrders);
router.patch('/:id/status', adminOnly, ordersController.updateStatus);

export default router;
