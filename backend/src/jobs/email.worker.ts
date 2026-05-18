import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

async function processEmailJob(job: Job): Promise<void> {
  const { name, data } = job;

  switch (name) {
    case 'verify-email':
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: data.to as string,
        subject: 'Verify your BookCart email',
        html: `<p>Hi ${data.name},</p><p>Click <a href="${process.env.FRONTEND_URL}/verify-email?token=${data.token}">here</a> to verify your email.</p>`,
      });
      break;

    case 'reset-password':
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: data.to as string,
        subject: 'Reset your BookCart password',
        html: `<p>Hi ${data.name},</p><p>Click <a href="${process.env.FRONTEND_URL}/reset-password?token=${data.token}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      });
      break;

    case 'order-confirmation':
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: data.email as string,
        subject: `BookCart — Order #${String(data.orderId).slice(-8).toUpperCase()} Confirmed`,
        html: `<p>Your order has been placed successfully. Order ID: ${data.orderId}</p>`,
      });
      break;

    default:
      logger.warn('Unknown email job', { name });
  }
}

export const emailWorker = new Worker('emails', processEmailJob, {
  connection: { url: env.REDIS_URL },
  concurrency: 5,
});

emailWorker.on('failed', (job, err) => {
  logger.error('Email job failed', { job: job?.name, error: err.message });
});
