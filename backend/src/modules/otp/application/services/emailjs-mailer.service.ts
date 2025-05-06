import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  LoggerService,
  DebugUtil,
  CorrelationService,
} from '@leocodeio-njs/njs-logging';
import * as nodemailer from 'nodemailer';
import { generateToken, verifyToken } from 'authenticator';
import { OtpService } from './otp.service';

@Injectable()
export class EmailjsMailerService {
  private isConfigured: boolean;
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly debugUtil: DebugUtil,
    private readonly otpService: OtpService,
    private readonly correlationService: CorrelationService,
  ) {
    this.logger.setLogContext('EmailjsMailerService');

    const gmailUser = this.configService.get('GMAIL_USER');
    const gmailAppPassword = this.configService.get('GMAIL_APP_PASSWORD');

    this.isConfigured = !!(gmailUser && gmailAppPassword);

    if (this.isConfigured) {
      // Initialize nodemailer transporter
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.logger.log('Email service initialized successfully');
    } else {
      this.logger.warn(
        'Email credentials not configured. Email features will be limited.',
      );
    }
  }

  async sendOtpMail(email: string, name: string, otp: string): Promise<void> {
    this.logger.debug('Attempting to send email with OTP', {
      email,
      correlationId: this.correlationService.getCorrelationId(),
    });

    if (!this.isConfigured) {
      this.logger.debug('[DEV MODE] Mock email send', {
        email,
        correlationId: this.correlationService.getCorrelationId(),
      });
      return;
    }

    try {
      const template = {
        subject: 'Your OTP Code',
        body: `Hello ${name}, your OTP code is ${otp}.`,
      };

      const mailOptions: nodemailer.SendMailOptions = {
        from: this.configService.get('EMAIL_FROM') || 'noreply@example.com',
        to: email,
        subject: template.subject,
        html: template.body,
      };

      const mailResult = await this.transporter.sendMail(mailOptions);

      this.debugUtil.debug(this.logger, 'Email sent successfully', {
        email,
        mailId: mailResult.messageId,
        correlationId: this.correlationService.getCorrelationId(),
      });
    } catch (error) {
      this.logger.error('Failed to send email', error, {
        email,
        correlationId: this.correlationService.getCorrelationId(),
      });
    }
  }

  async verifyOtpMail(email: string, code: string): Promise<boolean> {
    this.logger.debug('Attempting to verify email OTP', {
      email,
      correlationId: this.correlationService.getCorrelationId(),
    });

    try {
      return this.otpService.verifyToken(
        email,
        process.env.OTP_SALT || 'default-salt',
        code,
      );
    } catch (error) {
      this.logger.error('Failed to verify email OTP', error, {
        email,
        correlationId: this.correlationService.getCorrelationId(),
      });

      return false;
    }
  }
}
