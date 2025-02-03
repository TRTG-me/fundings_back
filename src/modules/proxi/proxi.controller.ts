import { Controller, Get } from '@nestjs/common';
import { ProxiService } from './proxi.service';

@Controller('')
export class ProxiController {
    constructor(private readonly proxyService: ProxiService,
    ) { }

    @Get('testProxy')
    testProxy() {
        return this.proxyService.testReq();
    }
}

