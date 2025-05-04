import { DataSource } from 'typeorm';
import { OTP_REPOSITORY } from 'src/services/constants';
import { OTP } from '../entities/otp.entity';

export const otpProvider = [
  {
    provide: OTP_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OTP),
    inject: [DataSource],
  },
];
