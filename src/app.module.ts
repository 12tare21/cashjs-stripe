import { Module } from '@nestjs/common';
import { UseCaseController } from './controllers/use-case.controller';

@Module({
  controllers: [UseCaseController],
})
export class AppModule {}
