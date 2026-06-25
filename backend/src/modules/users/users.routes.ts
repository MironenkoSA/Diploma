// src/modules/users/users.routes.ts
import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', usersController.getProfile);
router.patch('/profile', usersController.updateProfile);
router.post('/change-password', usersController.changePassword);
router.get('/orders', usersController.getOrders);
router.delete('/account', usersController.deleteAccount);

export default router;
