import { sendEmail } from '../services/email.service.js';
import { makeWorker } from './queue.js';

export function startEmailWorker() {
  return makeWorker('email-sender', async (job) => {
    const { to, subject, html } = job.data as { to: string; subject: string; html: string };
    await sendEmail(to, subject, html);
  });
}
