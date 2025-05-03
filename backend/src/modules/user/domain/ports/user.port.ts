import { IUser } from '../models/user.model';

export interface IUserPort {
  findById(id: string): Promise<IUser | null>;
  findByIdentifier(identifier: string): Promise<IUser | null>;
  save(user: Partial<IUser>): Promise<IUser>;
  update(id: string, user: Partial<IUser>): Promise<IUser>;
}
