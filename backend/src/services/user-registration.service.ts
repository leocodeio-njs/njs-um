import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { USER_PREFERENCES_REPOSITORY, USER_REPOSITORY } from './constants';
import * as bcrypt from 'bcryptjs';
import { AuthPolicyService } from './auth-policy.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from 'src/modules/user/application/dtos/register.dto';
import { UserProfileDto } from 'src/modules/user/application/dtos/user-profile.dto';
import { userStatus } from 'src/modules/user/domain/enums/user_status.enum';
import { UpdateDto } from 'src/modules/user/application/dtos/update.dto';
import { IUser } from 'src/modules/user/domain/models/user.model';
import { IUserPort } from 'src/modules/user/domain/ports/user.port';
import { IUserPreferencesPort } from 'src/modules/user/domain/ports/user-preferences.port';
import { IOtpPort } from 'src/modules/otp/domain/ports/otp.port';
import { DataSource } from 'typeorm';
import { UserPreferences } from 'src/modules/user/infrastructure/entities/user-preferences.entity';
import { User } from 'src/modules/user/infrastructure/entities/user.entity';

@Injectable()
export class UserRegistrationService {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: IUserPort,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private userPreferencesRepository: IUserPreferencesPort,
    @Inject('OTP_REPOSITORY') private otpRepository: IOtpPort,
    private readonly authPolicyService: AuthPolicyService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<UserProfileDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;
    try {
      // Verify mobile OTP only for mobile channel
      if (
        this.configService.get<boolean>('SMS_VERIFICATION') &&
        (dto.channel === 'mobile' || dto.channel === 'web')
      ) {
        const isValidOTP = await this.otpRepository.verify(
          dto.mobile,
          dto.mobileVerificationCode as string,
        );
        if (!isValidOTP) {
          throw new UnauthorizedException('Invalid mobile verification code');
        }
      }

      // Hash password
      const passwordHash = await this.hashPassword(dto.password);

      // Determine access level
      const accessLevel = this.authPolicyService.determineUserAccessLevel({
        email: dto.email,
        mobile: dto.mobile,
        firstName: dto.firstName,
        lastName: dto.lastName,
        profilePicUrl: dto.profilePicUrl,
        passwordHash,
        status: userStatus.ACTIVE,
        allowedChannels: ['mobile', 'web'],
        twoFactorEnabled: false,
      } as IUser);

      // const user = await this.userRepository.save({
      //   email: dto.email,
      //   mobile: dto.mobile,
      //   firstName: dto.firstName,
      //   lastName: dto.lastName,
      //   profilePicUrl: dto.profilePicUrl,
      //   passwordHash,
      //   status: userStatus.ACTIVE,
      //   allowedChannels: ['mobile', 'web'],
      //   accessLevel: accessLevel,
      //   twoFactorEnabled: false,
      // });

      // save user to the database
      const user = await manager.save(User, {
        email: dto.email,
        mobile: dto.mobile,
        firstName: dto.firstName,
        lastName: dto.lastName,
        profilePicUrl: dto.profilePicUrl,
        passwordHash,
        status: userStatus.ACTIVE,
        allowedChannels: ['mobile', 'web'],
        accessLevel: accessLevel,
        twoFactorEnabled: false,
      });

      // const userPreferences = await this.userPreferencesRepository.save({
      //   userId: user.id,
      //   language: dto.language,
      //   theme: dto.theme,
      //   timeZone: dto.timeZone,
      // });

      // save user preferences to the database
      const userPreferences = await manager.save(UserPreferences, {
        userId: user.id,
        language: dto.language,
        theme: dto.theme,
        timeZone: dto.timeZone,
      });
      if (!userPreferences) {
        throw new UnauthorizedException('User preferences not found');
      }

      return {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicUrl: user.profilePicUrl as string,
        language: userPreferences.language!,
        theme: userPreferences.theme!,
        timeZone: userPreferences.timeZone!,
        accessLevel: user.accessLevel,
        twoFactorEnabled: user.twoFactorEnabled,
        allowedChannels: user.allowedChannels,
        createdAt: user.createdAt,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(dto: UpdateDto, id: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updatedUser = await this.userRepository.update(id, {
      email: dto.email ? dto.email : user.email,
      mobile: dto.mobile ? dto.mobile : user.mobile,
      passwordHash: dto.password
        ? await this.hashPassword(dto.password)
        : user.passwordHash,
      firstName: dto.firstName ? dto.firstName : user.firstName,
      lastName: dto.lastName ? dto.lastName : user.lastName,
      profilePicUrl: dto.profilePicUrl ? dto.profilePicUrl : user.profilePicUrl,
      allowedChannels: dto.channel
        ? [dto.channel, ...user.allowedChannels]
        : user.allowedChannels,
      twoFactorEnabled: user.twoFactorEnabled,
      status: dto.status ? (dto.status as userStatus) : user.status,
      updatedAt: new Date(),
    });

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(id);
    if (!userPreferences) {
      throw new UnauthorizedException('User preferences not found');
    }
    const updatedUserPreferences = await this.userPreferencesRepository.update(
      id,
      {
        language: dto.language ? dto.language : userPreferences.language,
        theme: dto.theme ? dto.theme : userPreferences.theme,
        timeZone: dto.timeZone ? dto.timeZone : userPreferences.timeZone,
      },
    );

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profilePicUrl: updatedUser.profilePicUrl as string,
      language: updatedUserPreferences.language,
      theme: updatedUserPreferences.theme,
      timeZone: updatedUserPreferences.timeZone,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      allowedChannels: updatedUser.allowedChannels,
      accessLevel: updatedUser.accessLevel,
      createdAt: updatedUser.createdAt,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
}
