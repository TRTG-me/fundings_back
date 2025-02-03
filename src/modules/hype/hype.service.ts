import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateProxyConfig, instanceHype } from 'src/helpers/axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { calcBest, DataCountByCoins, deleteOldRecords, FindAllBd, getSorted, parseALL } from 'src/helpers/functions';
import { IAllBdResult, IBinData, IcalcBest, IDataCByCoins, IHypeDAta } from 'src/common/interfaces/auth';
import { calcBestToFront, getKoef } from 'src/helpers/functions2';


@Injectable()
export class HypeService {
    constructor(private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService) { }
    private portCounter = new Map<number, number>();


    public async hypeFundingRate(dayP: number): Promise<[IAllBdResult[], IcalcBest[]]> {
        try {
            const coins = (await this.prisma.coins.findMany({
                select: { bin: true, hype: true, hours: true }
            }
            )).map(element => [element.bin, element.hype, element.hours])

            const parse = await getKoef(this.prisma)

            const coinsFunding = await DataCountByCoins(coins, this.prisma)
            const promises = coinsFunding.map(async (element: IDataCByCoins, index: number) => {

                if (element.count !== 0) {

                    const times = await getSorted(element.symbolH, this.prisma)
                    const lastValue = times.new
                    const deleteTime = times.old

                    if (deleteTime < Date.now() - dayP * 24 * 3600 * 1000) {
                        await deleteOldRecords(dayP, element.symbolH, this.prisma)
                        console.log("удалены старые элементы", element.symbolH)
                    }

                    if (Date.now() - lastValue > (element.hours * 3600 * 1000 + 5000)) {
                        const timeStart = lastValue + 5000
                        const timeEnd = Date.now()
                        console.log("пора обновить", element.symbolH)
                        await this.mainFunction(element.symbolB, element.symbolH, timeStart, timeEnd, element.hours, index)
                    }
                    else { console.log("данные актуальные", element.symbolH) }
                }
                else {
                    const now = Date.now()
                    console.log("база чистая, заполняем...", element.symbolH)
                    if (dayP > 15) {
                        const subPromises = [];
                        for (let i = 0; i < Math.ceil(dayP / 15); i++) {
                            const timeStart = now - 86400000 * (dayP - i * 15);
                            const timeEnd = (dayP - (i + 1) * 15 <= 0) ? now : now - 86400000 * (dayP - (i + 1) * 15);
                            subPromises.push(await this.mainFunction(element.symbolB, element.symbolH, timeStart, timeEnd, element.hours, index))
                        }
                    }
                    else {
                        const timeStart = now - 86400000 * dayP
                        const timeEnd = now
                        await this.mainFunction(element.symbolB, element.symbolH, timeStart, timeEnd, element.hours, index)
                    }
                }
            })
            await Promise.all(promises);
            const AllBd: { id: number, coin: string, rate: number, date: number }[] = await FindAllBd(this.prisma)

            const result = parseALL(AllBd, coins)
            const calc = calcBest(result, parse.koef)
            const res = calcBestToFront(result, calc)

            return [res.filteredArray, res.calcRes]
        } catch (e) {
            throw new Error(e)
        }
    }
    public sumHypeRates(data: IHypeDAta[], size: number): { sum: number, time: number }[] {

        const newArr = data.map((element) => ({
            fundingRate: parseFloat(element.fundingRate),
            time: element.time
        }));
        const averages = []
        for (let i = 0; i < newArr.length; i += size) {
            const slice = newArr.slice(newArr.length - size - i, newArr.length - i)
            const sum = parseFloat(slice.reduce((acc, value) => acc + value.fundingRate, 0).toFixed(6))
            if (slice.length === 0) { console.log("empty") }
            else {
                const time = slice[slice.length - 1].time
                averages.unshift({ sum, time })
            }
        }

        return averages
    }

    private async mainFunction(symbolB: string, symbolH: string, timeStart: number, timeEnd: number, hours: number, index: number) {
        try {
            const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbolB}&startTime=${timeStart}&endTime=${timeEnd}`;
            const response = await firstValueFrom(this.httpService.get(url));
            const bindata = response.data;

            if (bindata.length === 0) {
                console.log("COIN:", symbolB, "нет данных с Binance");
                return;
            }

            // 2️⃣ Формируем данные для запроса к Hyperliquid
            const timeHLstart = response.data[0].fundingTime - ((hours - 1) * 3600 * 1000 + 5000);
            const timeHLend = response.data[response.data.length - 1].fundingTime + 5000;
            const payload = {
                type: "fundingHistory",
                coin: symbolH,
                startTime: timeHLstart,
                endTime: timeHLend
            };

            let retryCount = 0;
            let port = 11020 + Math.floor(index / 1);
            const MAX_RETRIES = 6;

            // 3️⃣ ДЕЛАЕМ ЗАПРОС К HYPERLIQUID (ПОВТОРЯЕМ ПРИ ОШИБКЕ)
            while (retryCount < MAX_RETRIES) {
                try {
                    const hypedata = await instanceHype.post('', payload, {
                        headers: { 'Content-type': 'application/json' },
                        proxy: generateProxyConfig(port),
                        timeout: 6000, // Уменьшаем таймаут до 7 секунд
                    });

                    // Логируем успешный запрос
                    const currentCount = this.portCounter.get(port) || 0;
                    this.portCounter.set(port, currentCount + 1);
                    console.log(`Запрос через порт ${port}, всего запросов: ${this.portCounter.get(port)}`);

                    // 4️⃣ Обрабатываем данные и сохраняем
                    const hypeDataSum = this.sumHypeRates(hypedata.data, hours);
                    let final;

                    if (hypeDataSum.length !== bindata.length) {
                        const [slicedHypeData, slicedBinData] = this.SliceArr(hypeDataSum, bindata);
                        final = slicedBinData.map((item: IBinData, index: number) => ({
                            fundingRate: (slicedHypeData[index].sum - parseFloat(item.fundingRate)).toFixed(8),
                            date: item.fundingTime
                        }));
                    } else {
                        final = bindata.map((item: IBinData, index: number) => ({
                            fundingRate: (hypeDataSum[index].sum - parseFloat(item.fundingRate)).toFixed(8),
                            date: item.fundingTime
                        }));
                    }

                    await this.saveToDatabase(symbolH, final);
                    return; // Успешное выполнение, выходим из цикла
                } catch (error) {
                    console.error(`Ошибка запроса к Hyperliquid (попытка ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
                    retryCount++;
                    port += 20 + (retryCount - 1); // Следующая попытка: +40, +41, +42...
                    console.log(`Повтор запроса к Hyperliquid с новым портом: ${port}`);

                }
            }

            console.error(`mainFunction завершилась неудачно после ${MAX_RETRIES} попыток.`);
        } catch (e) {
            console.error('Ошибка в mainFunction (Binance запрос):', e.message, symbolH, index);
        }
    }

    private SliceArr(arr1: { sum: number, time: number }[], arr2: IBinData[]): [{ sum: number, time: number }[], IBinData[]] {
        if (arr1.length < arr2.length) {
            arr2.splice(0, arr2.length - arr1.length);
        } else if (arr2.length < arr1.length) {
            arr1.splice(0, arr1.length - arr2.length);
        }
        return [arr1, arr2];
    }

    private async saveToDatabase(symbolH: string, data: { fundingRate: string; date: number }[]) {

        await this.prisma.$transaction(
            data.map(item =>
                this.prisma.fundings.create({
                    data: {
                        coin: symbolH,
                        rate: parseFloat(item.fundingRate),
                        date: item.date,
                    },
                })
            )
        );

    }

    public async deleteTable() {
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "fundings" RESTART IDENTITY CASCADE;`);
    }

    public async startBD(): Promise<[IAllBdResult[], IcalcBest[]]> {
        const AllBd: { id: number, coin: string, rate: number, date: number }[] = await FindAllBd(this.prisma)

        const coins = (await this.prisma.coins.findMany({
            select: { bin: true, hype: true, hours: true }
        }
        )).map(element => [element.bin, element.hype, element.hours])


        const parse = await getKoef(this.prisma)

        const result = parseALL(AllBd, coins)
        const calc = calcBest(result, parse.koef)
        const res = calcBestToFront(result, calc)
        return [res.filteredArray, res.calcRes]
    }

    public txtToArray(file: string): string[][] {
        const lines = file.trim().split('\n');
        const result = lines.map(line => line.trim().split(/\s+/));
        return result;
    }
}

