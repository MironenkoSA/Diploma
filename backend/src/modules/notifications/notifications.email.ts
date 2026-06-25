// src/modules/notifications/notifications.email.ts
import nodemailer from 'nodemailer';
import { config } from '../../config';
import { redis } from '../../config/redis';
import { DEFAULT_SETTINGS } from '../settings/settings.routes';
import { logger } from '../../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
});

interface NotifEmailData {
  to: string;
  name: string;
  title: string;
  body: string;
  productName: string;
  productPrice: string;
  productSlug: string;
}

export async function sendNotificationEmail(data: NotifEmailData) {
  const productUrl = `${config.FRONTEND_URL}/shop/${data.productSlug}`;

  const html = `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:Georgia,serif;background:#f9f6f0;margin:0;padding:24px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e0d5">
        <div style="background:#c8a882;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:2px">АТЕЛЬЕ ИСТОРИЙ</h1>
        </div>
        <div style="padding:28px">
          <p style="color:#6b5744;margin:0 0 6px;font-size:14px">Здравствуйте, ${data.name}!</p>
          <h2 style="color:#3d2b1f;margin:0 0 16px;font-size:18px">${data.title}</h2>
          <p style="color:#6b5744;line-height:1.7;margin:0 0 24px">${data.body}</p>
          <div style="background:#f9f6f0;border-radius:6px;padding:16px;margin-bottom:24px">
            <p style="color:#3d2b1f;font-weight:bold;margin:0 0 4px">${data.productName}</p>
            <p style="color:#c8a882;font-size:20px;margin:0">₽${data.productPrice}</p>
          </div>
          <a href="${productUrl}" style="display:inline-block;background:#c8a882;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-size:14px;letter-spacing:1px">
            Посмотреть товар
          </a>
          <p style="color:#a8998c;font-size:12px;margin-top:24px">
            Вы получили это письмо, потому что у вас настроено правило уведомлений в Ателье Историй.<br>
            Управлять уведомлениями можно в <a href="${config.FRONTEND_URL}/account/notifications" style="color:#c8a882">личном кабинете</a>.
          </p>
        </div>
      </div>
    </body></html>
  `;

  await transporter.sendMail({
    from: config.SMTP_FROM,
    to: data.to,
    subject: data.title,
    html,
  });
}

export async function sendEventRegistrationEmail(data: {
  to: string; name: string; eventTitle: string;
  eventDate: string; eventLocation: string; eventId: string;
}) {
  const eventUrl = `${config.FRONTEND_URL}/events/${data.eventId}`;
  const html = `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:Georgia,serif;background:#f9f6f0;margin:0;padding:24px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e0d5">
        <div style="background:#c8a882;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:2px">АТЕЛЬЕ ИСТОРИЙ</h1>
        </div>
        <div style="padding:28px">
          <p style="color:#6b5744;margin:0 0 16px">Здравствуйте, <strong>${data.name}</strong>!</p>
          <p style="color:#3d2b1f;font-size:18px;margin:0 0 20px">Вы записаны на мероприятие</p>
          <div style="background:#f9f6f0;border-radius:6px;padding:20px;margin-bottom:24px;border-left:3px solid #c8a882">
            <h2 style="color:#3d2b1f;margin:0 0 12px;font-size:18px">${data.eventTitle}</h2>
            <p style="color:#6b5744;margin:0 0 4px">📅 ${data.eventDate}</p>
            <p style="color:#6b5744;margin:0">📍 ${data.eventLocation}</p>
          </div>
          <a href="${eventUrl}" style="display:inline-block;background:#c8a882;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-size:14px">
            Подробнее о мероприятии
          </a>
        </div>
      </div>
    </body></html>
  `;

  await transporter.sendMail({
    from: config.SMTP_FROM,
    to: data.to,
    subject: `Вы записаны: ${data.eventTitle}`,
    html,
  });
}

export async function sendEventPaymentEmail(data: {
  to: string; name: string; eventTitle: string; eventDate: string;
  eventLocation: string; eventId: string; price: number; deadline: string;
  paymentHolder?: string; paymentBank?: string; paymentCard?: string;
}) {
  const eventUrl = `${config.FRONTEND_URL}/events/${data.eventId}`;

  // Берём реквизиты из настроек магазина (Redis)
  const stored = await redis.get('shop:settings').catch(() => null);
  const settings = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  const cardHolder = data.paymentHolder || settings.paymentCardHolder || DEFAULT_SETTINGS.paymentCardHolder;
  const bankName   = data.paymentBank   || settings.paymentBankName   || DEFAULT_SETTINGS.paymentBankName;
  const cardNumber = data.paymentCard   || settings.paymentCardNumber  || DEFAULT_SETTINGS.paymentCardNumber;

  const html = `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:Georgia,serif;background:#f9f6f0;margin:0;padding:24px">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e0d5">
        <div style="background:#3d2b1f;padding:24px;text-align:center">
          <h1 style="color:#e4cfb0;margin:0;font-size:16px;letter-spacing:3px">АТЕЛЬЕ ИСТОРИЙ</h1>
        </div>
        <div style="padding:32px">
          <p style="color:#6b5744;margin:0 0 8px">Здравствуйте, <strong>${data.name}</strong>!</p>
          <h2 style="color:#3d2b1f;font-size:20px;margin:0 0 24px;font-weight:400">Подтвердите участие оплатой</h2>

          <div style="background:#f9f6f0;border-radius:8px;padding:20px;margin-bottom:28px;border-left:4px solid #c8a882">
            <p style="color:#3d2b1f;font-weight:bold;font-size:16px;margin:0 0 8px">${data.eventTitle}</p>
            <p style="color:#6b5744;margin:0 0 4px">📅 ${data.eventDate}</p>
            <p style="color:#6b5744;margin:0">📍 ${data.eventLocation}</p>
          </div>

          <div style="background:#fff8f0;border:2px solid #c8a882;border-radius:8px;padding:24px;margin-bottom:28px">
            <p style="color:#6b5744;font-size:13px;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px">Реквизиты для оплаты</p>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="color:#6b5744;font-size:13px;padding:4px 0;width:40%">Получатель</td>
                  <td style="color:#3d2b1f;font-weight:bold">${cardHolder}</td></tr>
              <tr><td style="color:#6b5744;font-size:13px;padding:4px 0">Банк</td>
                  <td style="color:#3d2b1f">${bankName}</td></tr>
              <tr><td style="color:#6b5744;font-size:13px;padding:4px 0">Номер карты</td>
                  <td style="color:#3d2b1f;font-weight:bold;letter-spacing:2px">${cardNumber}</td></tr>
              <tr><td style="color:#6b5744;font-size:13px;padding:4px 0">Сумма</td>
                  <td style="color:#c8a882;font-weight:bold;font-size:18px">₽${data.price.toFixed(0)}</td></tr>
              <tr><td style="color:#6b5744;font-size:13px;padding:4px 0">Назначение</td>
                  <td style="color:#3d2b1f">Участие в мероприятии</td></tr>
            </table>
          </div>

          <div style="background:#fff4f4;border:1px solid #f4a0a0;border-radius:6px;padding:14px;margin-bottom:28px">
            <p style="color:#c0392b;font-size:14px;margin:0">
              ⏰ <strong>Оплатите до ${data.deadline}</strong> — после этого бронь будет автоматически аннулирована.
            </p>
          </div>

          <p style="color:#6b5744;font-size:13px;margin:0 0 20px;line-height:1.7">
            После перевода сохраните скриншот и отправьте его на <a href="mailto:hello@atelier-istoriy.ru" style="color:#c8a882">hello@atelier-istoriy.ru</a> с темой письма «Оплата — ${data.eventTitle}».
          </p>

          <a href="${eventUrl}" style="display:inline-block;background:#c8a882;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-size:14px;letter-spacing:0.5px">
            Страница мероприятия →
          </a>
        </div>
        <div style="background:#f9f6f0;padding:16px;text-align:center;border-top:1px solid #e8e0d5">
          <p style="color:#a89080;font-size:12px;margin:0">© Ателье Историй, г. Ростов-на-Дону, ул. Пушкинская, 48</p>
        </div>
      </div>
    </body></html>
  `;

  await transporter.sendMail({
    from: config.SMTP_FROM,
    to: data.to,
    subject: `Оплата участия — ${data.eventTitle}`,
    html,
  });
}
