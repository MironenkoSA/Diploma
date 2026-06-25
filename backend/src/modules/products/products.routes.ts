// src/modules/products/products.routes.ts
import { Router } from 'express';
import { productsController } from './products.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { adminOnly } from '../../middleware/adminOnly';

const router = Router();

// ── Public ──────────────────────────────────
router.get('/', productsController.getProducts);
router.get('/featured', productsController.getFeatured);
router.get('/countries', productsController.getCountries);
router.get('/recommendations', optionalAuth, productsController.getRecommendations);
router.get('/:slug', optionalAuth, productsController.getProduct);

// ── Admin (protected) ────────────────────────
router.post('/', authenticate, adminOnly, productsController.createProduct);
router.patch('/:id', authenticate, adminOnly, productsController.updateProduct);
router.delete('/:id', authenticate, adminOnly, productsController.deleteProduct);

export default router;
