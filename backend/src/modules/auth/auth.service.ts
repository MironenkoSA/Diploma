// src/modules/auth/auth.service.ts
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateTokenPair, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { sendVerificationEmail } from './auth.email';
import crypto from 'crypto';

export async function registerUser(data: {
  name: string; email: string; password: string; consentGiven: boolean;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Пользователь с таким email уже существует', 409);

  const passwordHash = await hashPassword(data.password);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      consentGiven: data.consentGiven,
      consentGivenAt: new Date(),
      emailVerified: false,
      emailVerifyToken,
    },
  });

  // Отправляем письмо с подтверждением
  sendVerificationEmail({ to: user.email, name: user.name, token: emailVerifyToken })
    .catch(err => logger.error('Verification email failed', err));

  const tokens = await generateTokenPair({ userId: user.id, role: user.role });
  await redis.set(`refresh:${user.id}`, tokens.refreshToken, 'EX', 7 * 24 * 3600);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified },
    ...tokens,
  };
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
  if (!user) throw new AppError('Недействительная или устаревшая ссылка подтверждения', 400);
  if (user.emailVerified) throw new AppError('Email уже подтверждён', 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });

  return { message: 'Email успешно подтверждён' };
}

export async function resendVerification(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('Пользователь не найден', 404);
  if (user.emailVerified) throw new AppError('Email уже подтверждён', 400);

  // Таймаут 1 час — защита от спама (лимит 500 писем/день)
  const cooldownKey = `verify_cooldown:${userId}`;
  const cooldown = await redis.get(cooldownKey);
  if (cooldown) {
    const ttl = await redis.ttl(cooldownKey);
    const mins = Math.ceil(ttl / 60);
    throw new AppError(`Следующее письмо можно запросить через ${mins} мин.`, 429);
  }

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.user.update({ where: { id: userId }, data: { emailVerifyToken: token } });
  await redis.set(cooldownKey, '1', 'EX', 3600); // 1 час

  await sendVerificationEmail({ to: user.email, name: user.name, token });
  return { message: 'Письмо отправлено повторно' };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Dummy hash против timing attacks
  if (!user) {
    await hashPassword('dummy_password_to_prevent_timing_attack');
    throw new AppError('Неверный email или пароль', 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new AppError('Неверный email или пароль', 401);
  if (user.deletedAt) throw new AppError('Аккаунт удалён', 403);

  const tokens = await generateTokenPair({ userId: user.id, role: user.role });
  await redis.set(`refresh:${user.id}`, tokens.refreshToken, 'EX', 7 * 24 * 3600);

  return {
    user: {
      id: user.id, name: user.name, email: user.email,
      role: user.role, emailVerified: user.emailVerified,
    },
    ...tokens,
  };
}

export async function refreshTokens(refreshToken: string) {
  let payload: any;
  try { payload = verifyRefreshToken(refreshToken); }
  catch { throw new AppError('Недействительный refresh token', 401); }

  const stored = await redis.get(`refresh:${payload.userId}`);
  if (!stored || stored !== refreshToken) throw new AppError('Refresh token отозван', 401);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.deletedAt) throw new AppError('Пользователь не найден', 404);

  const tokens = await generateTokenPair({ userId: user.id, role: user.role });
  await redis.set(`refresh:${user.id}`, tokens.refreshToken, 'EX', 7 * 24 * 3600);
  return tokens;
}

export async function logoutUser(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken) as any;
    await redis.del(`refresh:${payload.userId}`);
  } catch { /* уже истёк */ }
}
