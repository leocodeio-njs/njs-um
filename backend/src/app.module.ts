import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from '@leocodeio-njs/njs-config';
import {
  PerformanceInterceptor,
  ResponseInterceptor,
} from '@leocodeio-njs/njs-logging';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '@leocodeio-njs/njs-config';

import { HealthModule, PrometheusService } from '@leocodeio-njs/njs-health';
import { ValidationModule } from './modules/validation/validation.module';

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
    HealthModule,
    ValidationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrometheusService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: PerformanceInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
