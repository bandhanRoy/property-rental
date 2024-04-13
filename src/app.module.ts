import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './api/users/users.module';
import { ContractsModule } from './api/contracts/contracts.module';
import { ReservationsModule } from './api/reservations/reservations.module';
import { PropertiesModule } from './api/properties/properties.module';
import { AuthenticationModule } from './api/authentication/authentication.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from './config/db';
import { IsUniqueConstraint } from './decorators/is-unique.decorator';

@Module({
  imports: [
    UsersModule,
    ContractsModule,
    ReservationsModule,
    PropertiesModule,
    AuthenticationModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // Use useFactory, useClass, or useExisting
      // to configure the DataSourceOptions.
      useFactory: (configService: ConfigService) =>
        typeOrmConfig(configService),
      // dataSource receives the configured DataSourceOptions
      // and returns a Promise<DataSource>.
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, IsUniqueConstraint],
})
export class AppModule {}
