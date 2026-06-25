// src/modules/orders/email.service.ts
import nodemailer from 'nodemailer';
import { config } from '../../config';
import { logger } from '../../utils/logger';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
});

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  total: string;
  shippingAddress: string;
}

export async function sendOrderConfirmationToAdmin(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      i => `<tr>
        <td style="padding:8px;border-bottom:1px solid #e5e5e5">${i.name}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:center">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:right">₽${i.price}</td>
      </tr>`
    )
    .join('');

  const adminUrl = `${config.FRONTEND_URL}/admin/orders/${data.orderId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Georgia,serif;background:#f9f6f0;margin:0;padding:24px">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e0d5">
        <div style="background:#c8a882;padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px">АТЕЛЬЕ ИСТОРИЙ</h1>
          <p style="color:#f5ede4;margin:8px 0 0;font-size:14px">Новый заказ</p>
        </div>
        <div style="padding:32px">
          <h2 style="color:#3d2b1f;margin:0 0 16px">Order #${data.orderId.slice(0, 8).toUpperCase()}</h2>
          <p style="color:#6b5744;margin:0 0 4px"><strong>Покупатель:</strong> ${data.customerName}</p>
          <p style="color:#6b5744;margin:0 0 4px"><strong>Email:</strong> ${data.customerEmail}</p>
          <p style="color:#6b5744;margin:0 0 24px"><strong>Доставка:</strong> ${data.shippingAddress}</p>

          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f9f6f0">
                <th style="padding:10px 8px;text-align:left;color:#3d2b1f;font-size:13px">Товар</th>
                <th style="padding:10px 8px;text-align:center;color:#3d2b1f;font-size:13px">Кол-во</th>
                <th style="padding:10px 8px;text-align:right;color:#3d2b1f;font-size:13px">Цена</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:12px 8px;font-weight:bold;color:#3d2b1f">Итого</td>
                <td style="padding:12px 8px;font-weight:bold;color:#3d2b1f;text-align:right">₽${data.total}</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top:32px;text-align:center">
            <a href="${adminUrl}"
               style="display:inline-block;background:#c8a882;color:#fff;padding:14px 32px;border-radius:4px;text-decoration:none;font-size:15px;letter-spacing:1px">
              Открыть заказ в админ-панели
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: config.SMTP_FROM,
      to: config.ADMIN_EMAIL,
      subject: `Новый заказ #${data.orderId.slice(0, 8).toUpperCase()} — ${data.customerName}`,
      html,
    });
    logger.info(`Admin order email sent for order ${data.orderId}`);
  } catch (err) {
    logger.error('Failed to send admin order email', err);
    // Don't throw — email failure should not block order placement
  }
}

export async function sendOrderConfirmationToCustomer(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      i => `<tr>
        <td style="padding:8px;border-bottom:1px solid #e5e5e5">${i.name} × ${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e5e5;text-align:right">₽${i.price}</td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Georgia,serif;background:#f9f6f0;margin:0;padding:24px">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e0d5">
        <div style="background:#c8a882;padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:2px">АТЕЛЬЕ ИСТОРИЙ</h1>
        </div>
        <div style="padding:32px">
          <p style="color:#3d2b1f;font-size:18px">Спасибо за заказ, ${data.customerName}!</p>
          <p style="color:#6b5744">Ваш заказ принят и передан в обработку.</p>
          <p style="color:#6b5744"><strong>Номер заказа:</strong> №${data.orderId.slice(0, 8).toUpperCase()}</p>

          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td style="padding:12px 8px;font-weight:bold;color:#3d2b1f">Итого</td>
                <td style="padding:12px 8px;font-weight:bold;color:#3d2b1f;text-align:right">₽${data.total}</td>
              </tr>
            </tfoot>
          </table>

          <p style="color:#6b5744;margin-top:24px">
            Мы свяжемся с вами, как только отправим посылку.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: config.SMTP_FROM,
      to: data.customerEmail,
      subject: `Ваш заказ №${data.orderId.slice(0, 8).toUpperCase()} — Ателье Историй`,
      html,
    });
  } catch (err) {
    logger.error('Failed to send customer order email', err);
  }
}
