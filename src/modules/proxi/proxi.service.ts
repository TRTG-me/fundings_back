import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { instanceHype, proxyConfig, proxyConfigBin } from 'src/helpers/axios';

@Injectable()
export class ProxiService {
    constructor(private readonly httpService: HttpService,) { }

    public async testReq() {
        const payload = {
            type: "fundingHistory",
            coin: "PENGU",
            startTime: 1738256890000
        };

        // Создаем агент с прокси
        //const agent = new HttpsProxyAgent(`http://${proxyConfig.auth.username}:${proxyConfig.auth.password}@${proxyConfig.host}:${proxyConfig.port}`);

        // URL для запросов
        const binanceUrl = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=WIFUSDT&startTime=1736935200000&endTime=1738404000000`;
        const hyperliquidUrl = 'https://api.hyperliquid.xyz/info'; // Пример URL для Hyperliquid (нужно будет заменить на актуальный)

        // Массивы для хранения данных
        const binanceResults: any[] = [];
        const hyperliquidResults: any[] = [];


        // const binanceRequests = Array.from({ length: 700 }, (_, i) => {
        //     return axios.get(binanceUrl, {
        //         // httpsAgent: agent,
        //         timeout: 10000,
        //         headers: { 'Content-Type': 'application/json' },
        //     })
        //         .then((response) => {
        //             binanceResults.push(response.data);
        //             console.log(`Binance запрос ${i + 1} выполнен успешно`);
        //         })
        //         .catch((error) => {
        //             console.error(`Ошибка при запросе Binance ${i + 1}:`, error.response?.data || error.message);
        //             binanceResults.push({ error: error.message });
        //         });
        // });

        // Запуск 100 запросов для Hyperliquid параллельно
        const hyperliquidRequests = Array.from({ length: 600 }, (_, i) => {
            const port = 11040 + Math.floor(i / 59);
            const generateProxyConfig = (port: number) => {
                // Получаем последнюю цифру порта
                const lastDigit = port % 10;

                // Создаем новый логин, уменьшая последнюю цифру на 1
                const newLogin = `6gXXwo_${lastDigit === 0 ? 9 : lastDigit - 1}`;

                return {
                    host: 'rg-19656.sp2.ovh',
                    port: port,
                    protocol: 'http',
                    auth: {
                        username: newLogin, // Новый логин
                        password: 'YWjX1xEZJP17' // Оставляем пароль без изменений
                    }
                };
            };

            return instanceHype.post('', payload, {
                headers: {
                    'Content-type': 'application/json',
                },
                proxy: generateProxyConfig(port),
                timeout: 13000,
            })
                .then((response) => {
                    hyperliquidResults.push(response.data);
                    console.log(`Hyperliquid запрос ${i + 1} выполнен успешно`, port);
                })
                .catch((error) => {
                    console.error(`Ошибка при запросе Hyperliquid ${i + 1}:`, error.message, port);
                    hyperliquidResults.push({ error: error.message });
                });
        });

        // Запуск всех запросов одновременно с помощью Promise.all
        try {
            await Promise.all(hyperliquidRequests); // Здесь передаем массив промисов, а не уже завершенные запросы
        } catch (error) {
            console.error('Ошибка при выполнении запросов:', error.message);
        }

        // Выводим данные из обоих массивов
        //console.log('Данные с Binance:', binanceResults);
        // console.log('Данные с Hyperliquid:', hyperliquidResults);
    }
}

