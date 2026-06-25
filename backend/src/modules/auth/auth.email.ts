// src/modules/auth/auth.email.ts
import nodemailer from 'nodemailer';
import { config } from '../../config';

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
});

export async function sendVerificationEmail(data: {
  to: string; name: string; token: string;
}) {
  const backendUrl = (config as any).BACKEND_URL || config.FRONTEND_URL.replace('3003', '4003').replace('5173', '4000');
  const url = `${backendUrl}/api/auth/verify-email?token=${data.token}`;

  const html = `
    <!DOCTYPE html><html><head><meta charset="utf-8"></head>
    <body style="font-family:Georgia,serif;background:#f9f6f0;margin:0;padding:24px">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e0d5">
        <div style="background:#3d2b1f;padding:24px;text-align:center">
          <h1 style="color:#e4cfb0;margin:0;font-size:15px;letter-spacing:3px">АТЕЛЬЕ ИСТОРИЙ</h1>
        </div>
        <div style="padding:32px">
          <p style="color:#6b5744;margin:0 0 8px">Здравствуйте, <strong>${data.name}</strong>!</p>
          <h2 style="color:#3d2b1f;font-weight:400;font-size:20px;margin:0 0 16px">Подтвердите ваш email</h2>
          <p style="color:#6b5744;line-height:1.75;margin:0 0 28px">
            Для завершения регистрации нажмите кнопку ниже.<br>
            Ссылка действительна в течение <strong>24 часов</strong>.
          </p>
          <a href="${url}"
             style="display:inline-block;background:#c8a882;color:#fff;padding:13px 32px;border-radius:4px;text-decoration:none;font-size:14px;letter-spacing:0.5px">
            Подтвердить email
          </a>
          <p style="color:#a89080;font-size:12px;margin-top:28px;line-height:1.7">
            Если вы не регистрировались в Ателье Историй — просто проигнорируйте это письмо.<br>
            Ссылка: <a href="${url}" style="color:#c8a882">${url}</a>
          </p>
        </div>
        <div style="background:#f9f6f0;padding:14px;text-align:center;border-top:1px solid #e8e0d5">
          <p style="color:#a89080;font-size:11px;margin:0">© Ателье Историй, г. Ростов-на-Дону, ул. Пушкинская, 48</p>
        </div>
      </div>
    </body></html>
  `;

  await transporter.sendMail({
    from: config.SMTP_FROM,
    to: data.to,
    subject: 'Подтвердите email — Ателье Историй',
    html,
  });
}
