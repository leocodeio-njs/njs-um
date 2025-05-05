import { Module } from '@nestjs/common';
import { ValidationService } from './application/services/validation.service';
import { ValidationController } from './presentation/controllers/validation.controller';
import { JwtService } from '@nestjs/jwt';

import { UserRegistrationService } from 'src/services/user-registration.service';
import { UserAuthenticationService } from 'src/services/user-authentication.service';
import { AuthService } from 'src/services/auth.service';
import { AuthPolicyService } from 'src/services/auth-policy.service';
import { UserRepositoryAdapter } from '../user/infrastructure/adapters/user.repository';
import { IUserPort } from '../user/domain/ports/user.port';
import { usersProvider } from '../user/infrastructure/providers/users.provider';

import { TwoFactorAuthService } from 'src/services/two-factor-auth.service';
import { RateLimiterService } from 'src/services/rate-limiter.service';

import { TokenManagementService } from 'src/services/token-management.service';
import { SessionManagementService } from 'src/services/session-management.service';
import { SessionRepositoryAdapter } from '../session/infrastructure/adapters/session.repository';
import { ISessionPort } from '../session/domain/ports/session.port';
import { sessionProvider } from '../session/infrastructure/providers/session.provider';

import { MobileVerificationService } from 'src/services/mobile-verification.service';
import { OTPRepositoryAdaptor } from '../otp/infrastructure/adapters/otp.repository';
import { IOtpPort } from '../otp/domain/ports/otp.port';
import { otpProvider } from '../otp/infrastructure/providers/session.provider';

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
      provide: IOtpPort,
      useClass: OTPRepositoryAdaptor,
    },
    ...usersProvider,
    ...sessionProvider,
    ...otpProvider,
  ],
})
export class ValidationModule {}
