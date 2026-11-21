import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      ignoreTLS: true,
    });
  }

  async sendTemporaryPassword(
    toEmail: string,
    recipientName: string,
    temporaryPassword: string
  ): Promise<void> {
    const textContent = `Hello ${recipientName},

Your account on CCS Hub has been provisioned.

Temporary Password: ${temporaryPassword}

This temporary password will expire in 24 hours. You will be required to choose a new password upon your first sign in.

If you did not request this, please contact the CCS Dean's Office immediately.

Regards,
College of Computer Studies
Quezon City University`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;">
        <h2 style="color: #1E2A78; margin-top: 0;">Welcome to CCS Hub</h2>
        <p>Hello <strong>${recipientName}</strong>,</p>
        <p>Your account on CCS Hub has been activated. Please use the temporary credentials below to sign in:</p>
        <div style="background-color: #EEF2FF; border-left: 4px solid #1E2A78; padding: 12px 16px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #4B5563;">Temporary Password:</p>
          <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; letter-spacing: 1px; color: #1E2A78;">${temporaryPassword}</p>
        </div>
        <p style="color: #6B7280; font-size: 13px;">This password is valid for 24 hours. You will be prompted to set a permanent password immediately after logging in.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9CA3AF; margin-bottom: 0;">College of Computer Studies - Quezon City University</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `CCS Hub <${env.SMTP_FROM}>`,
        to: toEmail,
        subject: 'Your CCS Hub Temporary Password',
        text: textContent,
        html: htmlContent,
      });
    } catch (err) {
      // In development, log the error rather than failing the entire request if mailpit is offline
      console.error('Failed to dispatch temporary password email:', err);
    }
  }
}

export const emailService = new EmailService();
