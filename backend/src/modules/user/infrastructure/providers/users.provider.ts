import { User } from '../entities/user.entity';
import { UserPreferences } from '../entities/user-preferences.entity';
import { DataSource } from 'typeorm';

export const usersProvider = [
  {
    provide: 'UserRepository',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [DataSource],
  },
  {
    provide: 'UserPreferencesRepository',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserPreferences),
    inject: [DataSource],
  },
];
