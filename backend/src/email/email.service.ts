import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

    if (smtpHost && smtpPort && smtpUser && smtpPassword) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
      this.logger.log('Email service initialized');
    } else {
      this.logger.warn('Email service not configured. Email functionality will be disabled.');
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured. Email not sent.');
      return;
    }

    try {
      const from = this.configService.get<string>('EMAIL_FROM') || 'noreply@codecamp.com';

      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      });

      this.logger.log(`✅ Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - CodeCamp LMS',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to CodeCamp LMS!</h1>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - CodeCamp LMS',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
            .warning { background-color: #FEF3C7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset Request</h1>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <div class="warning">
              <p><strong>⚠️ This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>For security reasons, this link can only be used once.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to CodeCamp LMS!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3B82F6; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background-color: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CodeCamp LMS!</h1>
            </div>
            <div class="content">
              <p>Hi ${fullName},</p>
              <p>Welcome to CodeCamp LMS! We're excited to have you on board.</p>
              <p>Get started by:</p>
              <ul>
                <li>Exploring our courses</li>
                <li>Taking on coding challenges</li>
                <li>Following learning roadmaps</li>
                <li>Chatting with our AI Tutor</li>
              </ul>
              <p>Happy learning!</p>
              <p>The CodeCamp Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}

