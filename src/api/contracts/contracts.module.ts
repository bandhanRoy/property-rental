import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { Terms } from './entities/terms.entity';
import { PropertiesModule } from '../properties/properties.module';
import { UsersModule } from '../users/users.module';
import { TerminationRequest } from './entities/termination-request.entity';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, TerminationRequest, Terms]),
    PropertiesModule,
    UsersModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('contracts');
  }
}
