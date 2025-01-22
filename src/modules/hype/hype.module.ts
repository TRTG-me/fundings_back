import { Module } from '@nestjs/common';
import { HypeController } from './hype.controller';
import { HypeService } from './hype.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [HypeController],
  providers: [HypeService, PrismaService],
  exports: [HypeService],
})
export class HypeModule { }
