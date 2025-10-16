import { Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { GetInfoService } from './get-info.service';

@Controller('get-info')
export class GetInfoController {
  constructor(private readonly getInfoService: GetInfoService) { }

  @Get('account')
  async getAccountInfo() {
    try {
      return await this.getInfoService.getAccountData();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // @Post('create-order')
  // async createOrder() {
  //   try {
  //     // Вызываем новый, корректный метод
  //     return await this.getInfoService.createMarketLongOrderOfficial();
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}