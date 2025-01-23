import { IAllBdResult, IcalcBest, IDataCByCoins } from "src/common/interfaces/auth";

// Функция для получения самой старой записи по символу
export async function oldRecord(data: string[], prisma: any): Promise<any[]> {
    const records = await Promise.all(data.map(async (symbol) => {
        const [oldest, newest] = await prisma.fundings.findMany({
            where: { coin: symbol },
            orderBy: { date: 'asc' }, // Сортируем по дате (от старого к новому)
            take: 2, // Берем две записи (самую старую и самую новую)
        });

        return { coin: symbol, oldest, newest };
    }));

    return records;
}

// Функция для преобразования данных
export function count(array: [{ coin, fundingRate, premium, time }]): any[] {
    const result = array.map((element) => ({
        fundingRate: element.fundingRate,
        date: new Date(element.time).toISOString(),
    }));
    return result;
}

export async function getSorted(coin: string, prisma: any): Promise<{ old: number, new: number }> {
    const [oldest, newest] = await Promise.all([
        prisma.fundings.findFirst({
            where: { coin: coin },
            orderBy: { date: 'asc' }, // Самая старая запись
        }),
        prisma.fundings.findFirst({
            where: { coin: coin },
            orderBy: { date: 'desc' }, // Самая новая запись
        })
    ]);

    return {
        old: oldest.date, new: newest.date
    }
}

export async function deleteOldRecords(days: number, coin: string, prisma: any): Promise<void> {
    const now = Date.now(); // Текущая метка времени в миллисекундах
    const cutoffDate = now - days * 24 * 60 * 60 * 1000;
    // Удаляем записи старше этой временной метки
    await prisma.fundings.deleteMany({
        where: {
            coin: coin,
            date: { lt: cutoffDate }, // lt означает "меньше чем"
        },
    });

}

export async function DataCountByCoins(coins: string[][], prisma: any): Promise<IDataCByCoins[]> {
    const records = []
    for (const symbol of coins) {
        const count = await prisma.fundings.count({ where: { coin: symbol[1] } })
        records.push({ symbolB: symbol[0], symbolH: symbol[1], count, hours: parseFloat(symbol[2]) });
    }
    return records
}

export function percentsPerDays(final: { fundingRate: string; date: number }[], coin: string) {

}
export async function FindAllBd(prisma: any): Promise<{ id: number, coin: string, rate: number, date: number }[]> {
    const batchSize = 1000;
    let lastId = 0;
    let allData: any[] = [];

    while (true) {
        const data = await prisma.fundings.findMany({
            take: batchSize,
            where: lastId ? { id: { gt: lastId } } : {},
            orderBy: { id: 'asc' },
        });

        if (data.length === 0) break;

        console.log(`Выгрузка ${data.length} записей...`);

        allData = allData.concat(data);

        lastId = data[data.length - 1].id;
    }
    return allData;
}

export function parseALL(AllBd: { id: number, coin: string, rate: number, date: number }[], arr: string[][]): IAllBdResult[] {
    const groupedData = AllBd.reduce((acc, item) => {
        // Если coin уже есть в объекте, добавляем элемент, если нет - создаем новый массив
        if (!acc[item.coin]) {
            acc[item.coin] = [];
        }
        acc[item.coin].push(item);
        return acc;
    }, {});

    // Преобразуем объект в массив массивов и отсортируем по date
    const sortedGroupedData = Object.values(groupedData).map((group: any[]) =>
        group.sort((a, b) => a.date - b.date)
    );

    const result = sortedGroupedData
        .filter(group => arr.some(arrItem => arrItem[1] === group[0]?.coin)) // Оставляем только совпадающие
        .map(group => {
            const matchingItem = arr.find(arrItem => arrItem[1] === group[0].coin);
            let h = parseFloat(matchingItem[2]) === 8 ? 3 : 6;

            const averages = [];
            for (let i = 0; i < group.length; i += h) {
                const slice = group.slice(group.length - h - i, group.length - i);
                const sum = parseFloat(slice.reduce((acc, value) => acc + value.rate, 0).toFixed(6));
                if (slice.length > 0) {
                    const day = parseFloat((sum * 365 * 100).toFixed(2));
                    averages.unshift(day);
                }
            }
            const hours = group.map(element => parseFloat((element.rate * 365 * h * 100).toFixed(2)))

            const lastDay = averages[averages.length - 1];
            const getAverage = (days: number) =>
                averages.length >= days
                    ? parseFloat((averages.slice(-days).reduce((acc, v) => acc + v, 0) / days).toFixed(2))
                    : -1;


            return {
                coin: group[0].coin,
                hours: hours,
                days: averages,
                last1Day: lastDay,
                last3Days: getAverage(3),
                last7Days: getAverage(7),
                last14Days: getAverage(14),
                last30Days: getAverage(30),
                last60Days: getAverage(60)
            };
        });


    return result

}

export function calcBest(result: IAllBdResult[], koef: number[]): IcalcBest[] {
    const calcBest = result
        .map(element => {

            const calcGood = (element: number, k: number) => element < 0 ? "NO DATA" : element > k ? 'GOOD' : 'BAD'


            return {
                coin: element.coin,
                days1goodORbad: calcGood(element.last1Day, koef[0]),
                days3goodORbad: calcGood(element.last3Days, koef[1]),
                days7goodORbad: calcGood(element.last7Days, koef[2]),
                days14goodORbad: calcGood(element.last14Days, koef[3]),
                days30goodORbad: calcGood(element.last30Days, koef[4]),
                days60goodORbad: calcGood(element.last60Days, koef[5]),

            }
        })
    return calcBest
}



