import { Module } from '@nestjs/common';
import { PlaygroundController } from './controllers/playground.controller';

@Module({
  controllers: [PlaygroundController],
})
export class AppModule {}
