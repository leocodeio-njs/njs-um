import { IOtp } from '../models/otp.model';
export interface IOtpPort {
  save(otp: Partial<IOtp>): Promise<IOtp>;
  verify(mobile: string, code: string): Promise<boolean>;
  findPendingOTP(mobile: string): Promise<IOtp | null>;
  markAsVerified(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  findByReference(reference: string): Promise<IOtp | null>;
  deleteByReference(reference: string): Promise<void>;
}
