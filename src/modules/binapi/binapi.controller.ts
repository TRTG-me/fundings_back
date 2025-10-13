import { Controller, Get } from '@nestjs/common';
import { BinapiService } from './binapi.service';


@Controller('binapi')
export class BinapiController {
    constructor(private readonly binapi: BinapiService,

    ) { }

    @Get('bnb')
    async deleteTable() {
        return await this.binapi.buyBNB();
    }


}