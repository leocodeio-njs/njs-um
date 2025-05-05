import { Module } from '@nestjs/common';
import { OTP } from './infrastructure/entities/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpController } from './presentation/controllers/otp.controller';
import { AuthService } from 'src/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserAuthenticationService } from 'src/services/user-authentication.service';
import { TokenManagementService } from 'src/services/token-management.service';
import { SessionManagementService } from 'src/services/session-management.service';
import { TwoFactorAuthService } from 'src/services/two-factor-auth.service';
import { MobileVerificationService } from 'src/services/mobile-verification.service';
import { UserRegistrationService } from 'src/modules/user/application/services/user-registration.service';
import { RateLimiterService } from 'src/services/rate-limiter.service';
import { AuthPolicyService } from 'src/services/auth-policy.service';
import { usersProvider } from '../user/infrastructure/providers/users.provider';
import { sessionProvider } from '../session/infrastructure/providers/session.provider';
import { otpProvider } from './infrastructure/providers/session.provider';
import { IUserPort } from '../user/domain/ports/user.port';
import { UserRepositoryAdapter } from '../user/infrastructure/adapters/user.repository';
import { IUserPreferencesPort } from '../user/domain/ports/user-preferences.port';
import { UserPreferencesRepositoryAdapter } from '../user/infrastructure/adapters/user-preferences.repository';
import { IOtpPort } from './domain/ports/otp.port';
import { OTPRepositoryAdaptor } from './infrastructure/adapters/otp.repository';
import { SessionRepositoryAdapter } from '../session/infrastructure/adapters/session.repository';
import { ISessionPort } from '../session/domain/ports/session.port';

@Module({
  imports: [TypeOrmModule.forFeature([OTP])],
  controllers: [OtpController],
  providers: [
    AuthService,
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
      provide: ISessionPort,
      useClass: SessionRepositoryAdapter,
    },
    {
      provide: IOtpPort,
      useClass: OTPRepositoryAdaptor,
    },
    {
      provide: IUserPort,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: IUserPreferencesPort,
      useClass: UserPreferencesRepositoryAdapter,
    },
    ...usersProvider,
    ...sessionProvider,
    ...otpProvider,
  ],
})
export class OtpModule {}
