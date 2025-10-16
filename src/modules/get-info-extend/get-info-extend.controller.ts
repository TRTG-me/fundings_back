import { Controller, Post } from '@nestjs/common';
import { GetInfoExtendService } from './get-info-extend.service';

@Controller('Extended')
export class GetInfoExtendController { // Название может быть вашим
  constructor(private readonly getInfoExtendService: GetInfoExtendService) { }

  // Пример эндпоинта для создания РЫНОЧНОГО ордера
  @Post('info')
  async createMarketOrderTest() {

    return this.getInfoExtendService.getOpenPositions();
  }


}
