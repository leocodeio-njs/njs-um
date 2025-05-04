import { Module } from '@nestjs/common';
import { ValidationController } from './presentation/controllers/validation.controller';
import { ValidationService } from './application/services/validation.service';
import { usersProvider } from '../user/infrastructure/providers/users.provider';
import { IUserPort } from '../user/domain/ports/user.port';
import { UserRepositoryAdapter } from '../user/infrastructure/adapters/user.repository';
import { AuthService } from 'src/services/auth.service';
import { sessionProvider } from '../session/infrastructure/providers/session.provider';

import { ISessionPort } from '../session/domain/ports/session.port';
import { SessionRepositoryAdapter } from '../session/infrastructure/adapters/session.repository';
import { JwtService } from '@nestjs/jwt';
import { UserAuthenticationService } from 'src/services/user-authentication.service';
import { TokenManagementService } from 'src/services/token-management.service';
import { SessionManagementService } from 'src/services/session-management.service';
import { TwoFactorAuthService } from 'src/services/two-factor-auth.service';
import { MobileVerificationService } from 'src/services/mobile-verification.service';
import { UserRegistrationService } from 'src/services/user-registration.service';
import { RateLimiterService } from 'src/services/rate-limiter.service';
import { AuthPolicyService } from 'src/services/auth-policy.service';
import { otpProvider } from '../otp/infrastructure/providers/session.provider';
import { OTPRepositoryAdaptor } from '../otp/infrastructure/adapters/otp.repository';
import { AvailableSmsServices, OTP_REPOSITORY } from 'src/services/constants';
import { TwilioSmsService } from 'src/services/twilio.service';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

@Module({
  imports: [],
  controllers: [ValidationController],
  providers: [
    AuthService,
    ValidationService,
    JwtService,
    UserAuthenticationService,
    TokenManagementService,
    SessionManagementService,
    TwoFactorAuthService,
    MobileVerificationService,
    UserRegistrationService,
    RateLimiterService,
    AuthPolicyService,
    {
      provide: IUserPort,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: ISessionPort,
      useClass: SessionRepositoryAdapter,
    },
    {
      provide: OTP_REPOSITORY,
      useClass: OTPRepositoryAdaptor,
    },
    {
      provide: 'SMS_SERVICE',
      useClass:
        AvailableSmsServices[configService.get('SMS_SERVICE')] ||
        TwilioSmsService,
    },
    ...usersProvider,
    ...sessionProvider,
    ...otpProvider,
  ],
})
export class ValidationModule {}
