import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { instanceHype } from 'src/helpers/axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { calcBest, DataCountByCoins, deleteOldRecords, FindAllBd, getSorted, parseALL } from 'src/helpers/functions';
import { IBinData, IDataCByCoins, IHypeDAta } from 'src/common/interfaces/auth';


@Injectable()
export class HypeService {
    constructor(private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService) { }

    public days = this.configService.get('days')

    public async hypeFundingRate(dayP: number, coins: string[][], koef: number[]): Promise<any> {
        try {

            console.log(coins)
            const coinsFunding = await DataCountByCoins(coins, this.prisma)
            const promises = coinsFunding.map(async (element: IDataCByCoins) => {

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
                        await this.mainFunction(element.symbolB, element.symbolH, timeStart, timeEnd, element.hours)
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
                            subPromises.push(await this.mainFunction(element.symbolB, element.symbolH, timeStart, timeEnd, element.hours))

                        }

                    }
                    else {
                        const timeStart = now - 86400000 * dayP
                        const timeEnd = now
                        await this.mainFunction(element.symbolB, element.symbolH, timeStart, timeEnd, element.hours)


                    }
                }
            })
            await Promise.all(promises);
            const AllBd: { id: number, coin: string, rate: number, date: number }[] = await FindAllBd(this.prisma)
            const result = parseALL(AllBd, coins)
            console.log(result)
            calcBest(result, koef)
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

    private async mainFunction(symbolB: string, symbolH: string, timeStart: number, timeEnd: number, hours: number) {
        const arr = []
        const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbolB}&startTime=${timeStart}&endTime=${timeEnd}`
        const response = await firstValueFrom(this.httpService.get(url));
        const bindata = response.data
        console.log(response.data.length)
        if (bindata.length === 0) { console.log("нет данных с бина") } else {
            const timeHLstart = response.data[0].fundingTime - ((hours - 1) * 3600 * 1000 + 5000)
            const timeHLend = response.data[response.data.length - 1].fundingTime + 5000
            const payload = {
                type: "fundingHistory",
                coin: symbolH,
                startTime: timeHLstart,
                endTime: timeHLend
            }
            const hypedata = await instanceHype.post('', payload, {
                headers: {
                    'Content-type': 'application/json',
                }
            })

            const hypeDataSum = this.sumHypeRates(hypedata.data, hours)
            console.log("hype=", hypeDataSum.length, "bin=", bindata.length, "coin=", symbolH)
            if (hypeDataSum.length !== bindata.length) {

                console.log("пошла обрезка")
                const [slicedHypeData, slicedBinData] = this.SliceArr(hypeDataSum, bindata);
                const final = slicedBinData.map((item: IBinData, index: number) => (
                    {
                        fundingRate: (slicedHypeData[index].sum - parseFloat(item.fundingRate)).toFixed(6),
                        date: item.fundingTime
                    }
                ))

                await this.saveToDatabase(symbolH, final)

            } else {


                const final = bindata.map((item: IBinData, index: number) => (
                    {
                        fundingRate: (hypeDataSum[index].sum - parseFloat(item.fundingRate)).toFixed(6),
                        date: item.fundingTime
                    }
                ))
                await this.saveToDatabase(symbolH, final)

            }
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
}

