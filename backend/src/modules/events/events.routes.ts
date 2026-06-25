// src/modules/events/events.routes.ts
import { Router } from 'express';
import { prisma } from '../../config/database';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { adminOnly } from '../../middleware/adminOnly';
import { sendEventRegistrationEmail, sendEventPaymentEmail } from '../notifications/notifications.email';
import { z } from 'zod';
import { logger } from '../../utils/logger';

const router = Router();

const eventSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().min(1).trim(),
  imageUrl: z.string().optional().or(z.literal('')).refine(v => !v || v.startsWith('/') || v.startsWith('http'), 'Неверный URL'),
  location: z.string().min(1).max(255).trim(),
  speaker: z.string().max(200).trim().optional().or(z.literal('')),
  price: z.coerce.number().min(0).optional().nullable(),
  paymentHolder: z.string().max(200).trim().optional().or(z.literal('')),
  paymentBank:   z.string().max(200).trim().optional().or(z.literal('')),
  paymentCard:   z.string().max(30).trim().optional().or(z.literal('')),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  maxCapacity: z.coerce.number().int().min(1).optional(),
  isPublished: z.boolean().default(false),
});

const isFree = (event: any): boolean =>
  event.price === null || event.price === undefined || Number(event.price) === 0;

function validateDateRange(startsAt: string, endsAt: string): { ok: boolean; message?: string } {
  if (new Date(startsAt) < new Date(Date.now() - 60000)) { // допуск 1 минута
    return { ok: false, message: 'Дата начала не может быть в прошлом' };
  }
  if (new Date(endsAt) <= new Date(startsAt)) {
    return { ok: false, message: 'Дата окончания должна быть позже даты начала' };
  }
  return { ok: true };
}

// ══ ADMIN ROUTES ════════════════════════════════════════

router.get('/admin/all', authenticate, adminOnly, async (_req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startsAt: 'desc' },
      include: { _count: { select: { registrations: true } } },
    });
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
});

router.post('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const input = eventSchema.parse(req.body);
    const dateCheck = validateDateRange(input.startsAt, input.endsAt);
    if (!dateCheck.ok) {
      return res.status(400).json({ success: false, message: dateCheck.message });
    }
    const event = await prisma.event.create({
      data: { ...input, startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt) } as any,
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const input = eventSchema.partial().parse(req.body);
    if (input.startsAt && input.endsAt && new Date(input.endsAt) <= new Date(input.startsAt)) {
      return res.status(400).json({ success: false, message: 'Дата окончания должна быть позже даты начала' });
    }
    const data: Record<string, unknown> = { ...input };
    if (input.startsAt) data.startsAt = new Date(input.startsAt);
    if (input.endsAt) data.endsAt = new Date(input.endsAt);
    const event = await prisma.event.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Event not found' });
    next(err);
  }
});

// ══ PUBLIC ROUTES ════════════════════════════════════════

router.get('/', optionalAuth, async (req: any, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { isPublished: true, endsAt: { gte: new Date() } },
      orderBy: { startsAt: 'asc' },
      select: {
        id: true, title: true, description: true, imageUrl: true,
        location: true, startsAt: true, endsAt: true, maxCapacity: true,
        speaker: true, price: true,
        _count: { select: { registrations: true } },
      },
    });

    let registrationMap: Map<string, any> = new Map();
    if (req.user) {
      const myRegs = await prisma.eventRegistration.findMany({
        where: { userId: req.user.id },
        select: { eventId: true, status: true, paymentDeadline: true },
      });
      myRegs.forEach((r: any) => registrationMap.set(r.eventId, r));
    }

    const result = events.map((e: any) => {
      const reg = registrationMap.get(e.id);
      return {
        ...e,
        registrationCount: e._count.registrations,
        isRegistered: !!reg,
        registrationStatus: reg?.status ?? null,
        paymentDeadline: reg?.paymentDeadline ?? null,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.get('/:id/registrations', authenticate, adminOnly, async (req, res, next) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: req.params.id },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: registrations });
  } catch (err) { next(err); }
});

router.get('/:id', optionalAuth, async (req: any, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { registrations: true } } },
    });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!event.isPublished && req.user?.role !== 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    let registration = null;
    if (req.user) {
      registration = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: event.id, userId: req.user.id } },
        select: { status: true, paymentDeadline: true, paidAt: true },
      });
    }

    res.json({
      success: true,
      data: {
        ...event,
        registrationCount: event._count.registrations,
        isRegistered: !!registration,
        registrationStatus: registration?.status ?? null,
        paymentDeadline: registration?.paymentDeadline ?? null,
        paidAt: registration?.paidAt ?? null,
      },
    });
  } catch (err) { next(err); }
});

// ── ЗАПИСЬ НА МЕРОПРИЯТИЕ ────────────────────────────────
router.post('/:id/register', authenticate, async (req: any, res, next) => {
  try {
    const eventId = req.params.id;
    const userId: string = req.user.id;

    const registration = await prisma.$transaction(async (tx: any) => {
      const event = await tx.event.findUnique({
        where: { id: eventId, isPublished: true },
        include: { _count: { select: { registrations: true } } },
      });
      if (!event) throw Object.assign(new Error('Мероприятие не найдено'), { httpStatus: 404 });
      if (new Date() > event.endsAt) throw Object.assign(new Error('Мероприятие уже завершилось'), { httpStatus: 400 });
      if (event.maxCapacity && event._count.registrations >= event.maxCapacity) {
        throw Object.assign(new Error('Места закончились'), { httpStatus: 400 });
      }

      const free = isFree(event);
      // Платные: дедлайн 48 часов, статус PENDING_PAYMENT
      // Бесплатные: сразу CONFIRMED
      const status = free ? 'FREE' : 'PENDING_PAYMENT';
      const paymentDeadline = free ? null : new Date(Date.now() + 48 * 60 * 60 * 1000);

      return tx.eventRegistration.create({
        data: { eventId, userId, status, paymentDeadline },
        include: { event: true },
      });
    });

    const [event, user] = await Promise.all([
      prisma.event.findUnique({ where: { id: eventId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!event || !user) {
      return res.status(201).json({ success: true, data: registration });
    }

    const free = isFree(event);
    const formattedDate = new Date(event.startsAt).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    if (free) {
      // ── Бесплатное мероприятие ───────────────────────────
      prisma.notification.create({
        data: {
          userId,
          eventId,
          type: 'EVENT_REGISTERED',
          title: 'Вы записаны на мероприятие',
          body: `Регистрация на «${event.title}» подтверждена. Ждём вас!`,
        },
      }).catch(() => {});

      sendEventRegistrationEmail({
        to: user.email, name: user.name,
        eventTitle: event.title, eventDate: formattedDate,
        eventLocation: event.location, eventId,
      }).catch((e: Error) => logger.error('Event email failed', e));

    } else {
      // ── Платное мероприятие — отправляем реквизиты ────────
      const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

      // Уведомление 1: письмо отправлено
      prisma.notification.create({
        data: {
          userId,
          eventId,
          type: 'EVENT_REGISTERED',
          title: '📧 Письмо с реквизитами отправлено',
          body: `Для подтверждения участия в «${event.title}» оплатите ₽${Number(event.price).toFixed(0)} до ${deadline.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}. Бронь автоматически аннулируется при неоплате.`,
        },
      }).catch(() => {});

      // Письмо с реквизитами
      sendEventPaymentEmail({
        to: user.email,
        name: user.name,
        eventTitle: event.title,
        eventDate: formattedDate,
        eventLocation: event.location,
        eventId,
        price: Number(event.price),
        deadline: deadline.toLocaleDateString('ru-RU', {
          day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
      }).catch((e: Error) => logger.error('Payment email failed', e));
    }

    res.status(201).json({ success: true, data: registration });
  } catch (err: any) {
    if (err.httpStatus) return res.status(err.httpStatus).json({ success: false, message: err.message });
    if (err.code === 'P2002') return res.status(409).json({ success: false, message: 'Вы уже записаны' });
    next(err);
  }
});

// ── Отмена записи ────────────────────────────────────────
router.delete('/:id/register', authenticate, async (req: any, res, next) => {
  try {
    await prisma.eventRegistration.delete({
      where: { eventId_userId: { eventId: req.params.id, userId: req.user.id } },
    });
    res.json({ success: true, message: 'Запись отменена' });
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Запись не найдена' });
    next(err);
  }
});

// ── CRON: отмена просроченных броней ─────────────────────
// Вызывается каждые 15 минут из bootstrap
export async function cancelExpiredRegistrations() {
  try {
    const expired = await prisma.eventRegistration.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        paymentDeadline: { lt: new Date() },
      },
      include: {
        event: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (expired.length === 0) return;

    for (const reg of expired) {
      await prisma.eventRegistration.update({
        where: { id: reg.id },
        data: { status: 'CANCELLED' },
      });

      // Уведомление пользователю
      prisma.notification.create({
        data: {
          userId: reg.userId,
          eventId: reg.eventId,
          type: 'EVENT_REGISTERED',
          title: '❌ Бронь аннулирована',
          body: `Ваша бронь на «${reg.event.title}» отменена — оплата не поступила в течение 48 часов.`,
        },
      }).catch(() => {});
    }

    logger.info(`Cancelled ${expired.length} expired event registrations`);
  } catch (err) {
    logger.error('cancelExpiredRegistrations error', err);
  }
}

export default router;
