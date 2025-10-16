import { Module } from '@nestjs/common';
import { GetInfoExtendService } from './get-info-extend.service';
import { GetInfoExtendController } from './get-info-extend.controller';

@Module({
  controllers: [GetInfoExtendController],
  providers: [GetInfoExtendService],
})
export class GetInfoExtendModule { }
