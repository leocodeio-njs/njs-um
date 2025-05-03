import { IUserPreferences } from '../models/user-preferences.model';

export interface IUserPreferencesPort {
  findByUserId(userId: string): Promise<IUserPreferences | null>;
  save(IUserPreferences: Partial<IUserPreferences>): Promise<IUserPreferences>;
  update(
    id: string,
    IUserPreferences: Partial<IUserPreferences>,
  ): Promise<IUserPreferences>;
}
