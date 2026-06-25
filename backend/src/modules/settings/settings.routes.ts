// src/modules/settings/settings.routes.ts
import { Router } from 'express';
import { redis } from '../../config/redis';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/adminOnly';
import { z } from 'zod';

const router = Router();
const SETTINGS_KEY = 'shop:settings';

const settingsSchema = z.object({
  shopName:    z.string().min(1).max(100).trim().optional(),
  email:       z.string().email().optional(),
  phone:       z.string().max(30).trim().optional(),
  address:     z.string().max(255).trim().optional(),
  city:        z.string().max(100).trim().optional(),
  hours:       z.string().max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
  paymentCardNumber:  z.string().max(30).trim().optional(),
  paymentCardHolder:  z.string().max(100).trim().optional(),
  paymentBankName:    z.string().max(100).trim().optional(),
});

export const DEFAULT_SETTINGS = {
  shopName:    'Ателье Историй',
  email:       'hello@atelier-istoriy.ru',
  phone:       '+7 (863) 210-45-78',
  address:     'ул. Пушкинская, д. 48',
  city:        'г. Ростов-на-Дону, 344082',
  hours:       'Пн–Сб, 10:00–19:00',
  description: 'Антикварные вещи из Европы, отобранные за качество, историю и непреходящую красоту.',
  paymentCardNumber:  '4276 •••• •••• 7734',
  paymentCardHolder:  'ИП Соколова А.В.',
  paymentBankName:    'Тинькофф Банк',
};

// GET /api/settings — публичный
router.get('/', async (_req, res, next) => {
  try {
    const stored = await redis.get(SETTINGS_KEY);
    const data = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// PATCH /api/settings — только admin
router.patch('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const input = settingsSchema.parse(req.body);
    const stored = await redis.get(SETTINGS_KEY);
    const current = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS };
    const updated = { ...current, ...input };
    await redis.set(SETTINGS_KEY, JSON.stringify(updated));
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

export default router;
