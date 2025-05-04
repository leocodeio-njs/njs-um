import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from '@leocodeio-njs/njs-config';
import {
  LogEntry,
  LoggerService,
  LoggingInterceptor,
  LoggingModule,
  PerformanceInterceptor,
  ResponseInterceptor,
} from '@leocodeio-njs/njs-logging';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '@leocodeio-njs/njs-config';

import { HealthModule, PrometheusService } from '@leocodeio-njs/njs-health';

// modules
import { ValidationModule } from './modules/validation/validation.module';
import { UserModule } from './modules/user/user-auth.module';
import { OtpModule } from './modules/otp/otp.module';
import { SessionModule } from './modules/session/session.module';

@Module({
  imports: [
    AppConfigModule,

    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        ...configService.databaseConfig,
        entities: [__dirname + '/**/*.schema{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([LogEntry]),
    LoggingModule.forRoot({
      entities: [LogEntry],
      winston: {
        console: true,
        file: {
          enabled: true,
        },
      },
    }),
    HealthModule,
    ValidationModule,
    UserModule,
    SessionModule,
    OtpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrometheusService,
    LoggerService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: PerformanceInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
