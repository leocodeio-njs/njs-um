import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/entities/user.entity';
import { UserPreferences } from './infrastructure/entities/user-preferences.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPreferences])],
  controllers: [],
  providers: [],
})
export class UserModule {}
