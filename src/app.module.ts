import { Module } from '@nestjs/common';
import { UseCaseController } from './controller/use-case.controller';

@Module({
  controllers: [UseCaseController]
})
export class AppModule {}
