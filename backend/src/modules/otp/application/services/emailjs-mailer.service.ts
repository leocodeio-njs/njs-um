import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  LoggerService,
  DebugUtil,
  CorrelationService,
} from '@leocodeio-njs/njs-logging';
import * as nodemailer from 'nodemailer';
import { generateToken, verifyToken as verifyTokenLib } from 'authenticator';

// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// export default transporter;

@Injectable()
export class EmailjsMailerService {
  private isConfigured: boolean;
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly debugUtil: DebugUtil,
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

  async sendOtpMail(
    recipientEmail: string,
    recipientName: string,
  ): Promise<{ isValid: boolean; message: string; payload?: any }> {
    this.logger.debug('Attempting to send email', {
      recipientEmail,
      correlationId: this.correlationService.getCorrelationId(),
    });

    if (!this.isConfigured) {
      this.logger.debug('[DEV MODE] Mock email send', {
        recipientEmail,
        correlationId: this.correlationService.getCorrelationId(),
      });
      return {
        isValid: true,
        message: '[DEV MODE] Email would have been sent',
        payload: {
          recipientEmail,
        },
      };
    }

    try {
      // get code
      const code = generateToken(
        recipientEmail + 'AUTH' + this.configService.get('TOPT_SECRET'),
      );

      // Get template from database
      const template = {
        subject: 'Welcome!',
        body: `Hey welcome to our service ${recipientName}, here is your code ${code}`,
      };
      if (!template) {
        throw new Error('Template not found');
      }
      // Prepare email options
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.configService.get('EMAIL_FROM') || 'noreply@example.com',
        to: recipientEmail,
        subject: template.subject,
        html: template.body,
      };

      // Send the email
      const mailResult = await this.transporter.sendMail(mailOptions);

      this.debugUtil.debug(this.logger, 'Email sent successfully', {
        recipientEmail,
        mailId: mailResult.messageId,
        correlationId: this.correlationService.getCorrelationId(),
      });

      return {
        isValid: true,
        message: 'Email sent successfully',
        payload: {
          recipientEmail,
          messageId: mailResult.messageId,
        },
      };
    } catch (error) {
      this.logger.error('Failed to send email', error, {
        recipientEmail,
        correlationId: this.correlationService.getCorrelationId(),
      });

      return {
        isValid: false,
        message: 'Failed to send email',
      };
    }
  }

  async verifyOtpMail(
    recipientEmail: string,
    code: string,
  ): Promise<{ isValid: boolean; message: string }> {
    this.logger.debug('Attempting to verify email OTP', {
      recipientEmail,
      correlationId: this.correlationService.getCorrelationId(),
    });

    if (!this.isConfigured) {
      this.logger.debug('[DEV MODE] Mock email verification', {
        recipientEmail,
        correlationId: this.correlationService.getCorrelationId(),
      });
      return {
        isValid: true,
        message: '[DEV MODE] Email verification would have been successful',
      };
    }

    try {
      const isValid = verifyTokenLib(
        code,
        recipientEmail + 'AUTH' + this.configService.get('TOPT_SECRET'),
      );

      if (isValid) {
        return {
          isValid: true,
          message: 'Email OTP verified successfully',
        };
      } else {
        return {
          isValid: false,
          message: 'Invalid email OTP',
        };
      }
    } catch (error) {
      this.logger.error('Failed to verify email OTP', error, {
        recipientEmail,
        correlationId: this.correlationService.getCorrelationId(),
      });

      return {
        isValid: false,
        message: 'Failed to verify email OTP',
      };
    }
  }
}
