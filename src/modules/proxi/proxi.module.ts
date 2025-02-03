import { Module } from '@nestjs/common';
import { ProxiController } from './proxi.controller';
import { ProxiService } from './proxi.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ProxiController],
  providers: [ProxiService]
})
export class ProxiModule { }
