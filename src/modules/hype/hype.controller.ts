import { Body, Controller, Post } from '@nestjs/common';
import { HypeService } from './hype.service';

@Controller('')
export class HypeController {
    constructor(private readonly hypeService: HypeService) { }

    @Post('H')
    async getFundingRate(@Body() body: { days: number, coins: string[][], koef: number[] }) {
        return this.hypeService.hypeFundingRate(body.days, body.coins, body.koef);
    }
    @Post('D')
    async deleteTable() {
        return await this.hypeService.deleteTable();
    }
}
