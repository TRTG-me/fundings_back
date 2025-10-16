import { Module } from '@nestjs/common';
import { GetInfoService } from './get-info.service';
import { GetInfoController } from './get-info.controller';

@Module({
  controllers: [GetInfoController],
  providers: [GetInfoService],
})
export class GetInfoModule { }
