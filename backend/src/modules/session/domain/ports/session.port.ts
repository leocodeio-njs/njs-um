import { Provider } from '@nestjs/common';
import { ISession } from '../models/session.model';

export interface ISessionPort {
  create(session: ISession): Promise<void>;
  invalidate(sessionId: string, reason: string): Promise<void>;
  invalidateAllUserSessions(userId: string, reason: string): Promise<void>;
  isValid(sessionId: string): Promise<boolean>;
  findSessionById(sessionId: string): Promise<ISession | null>;
  cleanupExpiredSessions(): Promise<void>;
  getUserActiveSessions(userId: string): Promise<ISession[]>;
  update(sessionId: string, updates: Partial<ISession>): Promise<void>;
}
