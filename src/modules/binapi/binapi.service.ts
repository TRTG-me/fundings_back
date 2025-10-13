import { Injectable } from '@nestjs/common';
import { UMFutures } from '@binance/futures-connector';
import { FuturesPositionResponse } from 'src/common/interfaces/auth';

@Injectable()
export class BinapiService {


    public async buyBNB() {
        const apiKey = '7c3318101df12ee5dc93692f7684f9c8cd089497ff3932f8989b1d825203d314';
        const apiSecret = 'b5cb33901cc20a0add14035ac701b67ad59c6fb2a1683f70f9204540f76e7b1b';
        const baseURL = 'https://testnet.binancefuture.com';
        //const baseURL = 'https://papi.binance.com';

        const umFuturesClient = new UMFutures(apiKey, apiSecret, { baseURL });
        //umFuturesClient.product = 'papi';
        const symbol = 'ETHUSDT';
        const side = 'BUY';
        const type = 'MARKET';
        const quantity = 0.008; // Покупаем 0.2 BNB
        const recvWindow = 5000;

        //console.log('Placing order:', { symbol, side, type, quantity });

        try {
            const response = await umFuturesClient.newOrder(symbol, side, type, { quantity, recvWindow });
            //const response = await umFuturesClient.newOrderPM(symbol, side, type, { quantity, recvWindow });
            //const response = await umFuturesClient.getAccountInformationPM();
            //const response = await umFuturesClient.getPositionInformationPM({ symbol: 'BNBUSDT' });
            //const data: FuturesPositionResponse[] = response.data;
            console.log('Order Response:', response.data);
            return response.data;
        } catch (err) {
            console.error('Error placing order:', err.response?.data || err.message);
            throw err;
        }
    }
}
//.newOrder(symbol, side, type, { quantity, recvWindow });