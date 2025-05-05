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
import { UserRegistrationService } from 'src/services/user-registration.service';
import { RateLimiterService } from 'src/services/rate-limiter.service';
import { AuthPolicyService } from 'src/services/auth-policy.service';
import { otpProvider } from '../otp/infrastructure/providers/session.provider';

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
    ...usersProvider,
    ...sessionProvider,
    ...otpProvider,
  ],
})
export class UserModule {}
