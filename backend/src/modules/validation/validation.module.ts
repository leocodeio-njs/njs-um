import { Module } from '@nestjs/common';
import { ValidationController } from './presentation/controllers/validation.controller';
import { ValidationService } from './application/services/validation.service';
import { usersProvider } from '../user/infrastructure/providers/users.provider';
import { IUserPort } from '../user/domain/ports/user.port';
import { UserRepositoryAdapter } from '../user/infrastructure/adapters/user.repository';

@Module({
  imports: [],
  controllers: [ValidationController],
  providers: [
    ValidationService,
    {
      provide: IUserPort,
      useClass: UserRepositoryAdapter,
    },
    ...usersProvider,
  ],
})
export class ValidationModule {}
