// src/modules/notifications/notifications.service.ts
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { sendNotificationEmail } from './notifications.email';


type RuleWithUser = any;

type ProductWithCategory = any;

export async function checkNotificationRulesForProduct(productId: string): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    }) as ProductWithCategory | null;

    if (!product || !product.isActive) return;

    // MAJOR-06: Предфильтрация по categoryId в БД — уменьшает N правил для проверки
    const rules = await prisma.notificationRule.findMany({
      where: {
        isActive: true,
        OR: [
          { categoryId: null },
          { categoryId: product.categoryId },
        ],
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    }) as RuleWithUser[];

    const matchingRules = rules.filter((rule) => matchesRule(product, rule));

    for (const rule of matchingRules) {
      const alreadyNotified = await prisma.notification.findFirst({
        where: { userId: rule.userId, productId: product.id, ruleId: rule.id },
      });
      if (alreadyNotified) continue;

      const title = `Новый товар по правилу "${rule.name}"`;
      const body = `Появился "${product.name}" — ₽${Number(product.price).toFixed(0)}`;

      if (rule.notifyInApp) {
        await prisma.notification.create({
          data: {
            userId: rule.userId,
            ruleId: rule.id,
            productId: product.id,
            type: 'NEW_PRODUCT',
            title,
            body,
          },
        });
      }

      if (rule.notifyByEmail) {
        sendNotificationEmail({
          to: rule.user.email,
          name: rule.user.name,
          title,
          body,
          productName: product.name,
          productPrice: Number(product.price).toFixed(2),
          productSlug: product.slug,
        }).catch((err: Error) => logger.error('Notification email failed', err));
      }
    }

    logger.info(
      `Checked ${rules.length} rules for product "${product.name}", ${matchingRules.length} matched`
    );
  } catch (err) {
    logger.error('checkNotificationRulesForProduct error', err);
  }
}

function matchesRule(product: any, rule: any): boolean {
  if (rule.categoryId && product.categoryId !== rule.categoryId) return false;

  if (rule.countryOfOrigin) {
    const country = product.countryOfOrigin?.toLowerCase() ?? '';
    if (!country.includes(rule.countryOfOrigin.toLowerCase())) return false;
  }

  if (rule.keyword) {
    const kw = rule.keyword.toLowerCase();
    const inName = product.name.toLowerCase().includes(kw);
    const inDesc = product.description.toLowerCase().includes(kw);
    if (!inName && !inDesc) return false;
  }

  if (rule.minPrice && Number(product.price) < Number(rule.minPrice)) return false;
  if (rule.maxPrice && Number(product.price) > Number(rule.maxPrice)) return false;

  if (rule.eraFrom || rule.eraTo) {
    const productEraNum = product.era ? parseInt(product.era) : null;
    if (!productEraNum) return false;
    if (rule.eraFrom && !isNaN(parseInt(rule.eraFrom)) && productEraNum < parseInt(rule.eraFrom)) return false;
    if (rule.eraTo && !isNaN(parseInt(rule.eraTo)) && productEraNum > parseInt(rule.eraTo)) return false;
  }

  return true;
}
