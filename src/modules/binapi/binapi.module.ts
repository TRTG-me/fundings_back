import { Module } from '@nestjs/common';
import { BinapiController } from './binapi.controller';
import { BinapiService } from './binapi.service';

@Module({
  controllers: [BinapiController],
  providers: [BinapiService]
})
export class BinapiModule {}
