import nodemailer from 'nodemailer';
import { logger } from '../lib/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'AlphaNex <noreply@alphanex.app>',
      to, subject, html,
    });
  } catch (e: any) {
    logger.warn({ err: e?.message }, 'email send failed');
  }
}

export const emailTemplates = {
  resetPassword: (link: string) => `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password (valid 15 minutes):</p>
    <a href="${link}">${link}</a>
  `,
  welcome: (email: string) => `<h2>Welcome to AlphaNex AI Trade</h2><p>Hello ${email}, your account is ready.</p>`,
  approved: (type: string, amount: string) => `<p>Your ${type} of ${amount} has been approved.</p>`,
  rejected: (type: string, reason: string) => `<p>Your ${type} was rejected: ${reason}</p>`,
};
