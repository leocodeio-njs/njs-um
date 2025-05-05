import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/entities/user.entity';
import { UserPreferences } from './infrastructure/entities/user-preferences.entity';
import { UserAuthController } from './presentation/controllers/user-auth.controller';
import { AuthService } from 'src/services/auth.service';
import { usersProvider } from './infrastructure/providers/users.provider';
import { sessionProvider } from '../session/infrastructure/providers/session.provider';
import { JwtService } from '@nestjs/jwt';
import { UserAuthenticationService } from 'src/services/user-authentication.service';
import { TokenManagementService } from 'src/services/token-management.service';
import { SessionManagementService } from 'src/services/session-management.service';
import { TwoFactorAuthService } from 'src/services/two-factor-auth.service';
import { MobileVerificationService } from 'src/services/mobile-verification.service';
import { UserRegistrationService } from 'src/modules/user/application/services/user-registration.service';
import { RateLimiterService } from 'src/services/rate-limiter.service';
import { AuthPolicyService } from 'src/services/auth-policy.service';
import { otpProvider } from '../otp/infrastructure/providers/session.provider';
import { IUserPreferences } from './domain/models/user-preferences.model';
import { IUserPort } from './domain/ports/user.port';
import { UserRepositoryAdapter } from './infrastructure/adapters/user.repository';
import { UserPreferencesRepositoryAdapter } from './infrastructure/adapters/user-preferences.repository';
import { IUserPreferencesPort } from './domain/ports/user-preferences.port';
import { IOtpPort } from '../otp/domain/ports/otp.port';
import { OTPRepositoryAdaptor } from '../otp/infrastructure/adapters/otp.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPreferences])],
  controllers: [UserAuthController],
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
      provide: IUserPort,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: IUserPreferencesPort,
      useClass: UserPreferencesRepositoryAdapter,
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
export class UserModule {}
