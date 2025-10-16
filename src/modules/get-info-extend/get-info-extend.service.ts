// get-info-extend.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GetInfoExtendService {

  private readonly apiKey = 'ab380fa29f502d07d36bc3127eb8bd86'; // <--- НЕ ЗАБУДЬТЕ ЗАМЕНИТЬ
  private readonly baseUrl = 'https://api.starknet.extended.exchange/api/v1';

  // ... ваш существующий метод getAccountInfo ...
  public async getOpenPositions(marketId?: string) {


    // Готовим параметры запроса. marketId будет добавлен, только если он передан в метод.
    const params: { marketId?: string } = {};
    if (marketId) {
      params.marketId = marketId;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/user/positions`, {
        headers: {
          'X-Api-Key': this.apiKey,
          'User-Agent': 'MyNestJSApp/1.0.0',
        },
        params: params, // axios добавит это в URL как ?marketId=...
      });

      return response.data;

    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      } else {
        throw new HttpException('An unexpected error occurred.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}