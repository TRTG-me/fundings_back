import { IAllBdResult, IcalcBest } from "src/common/interfaces/auth";
import { calcBest, FindAllBd, parseALL } from "../functions";

export async function saveCoinstoBd(arr: string[][], prisma: any) {
    const existingBins = new Set<string>();

    // Получаем все существующие значения bin из базы данных
    const existingCoins = await prisma.coins.findMany({
        select: { bin: true }
    });
    console.log(existingCoins)
    // Добавляем существующие значения bin в множество
    existingCoins.forEach((coin: { bin: string }) => existingBins.add(coin.bin));

    // Фильтруем массив, чтобы оставить только уникальные строки по колонке bin
    const uniqueItems = arr.filter(item => !existingBins.has(item[0]));

    try {

        await prisma.$transaction(
            uniqueItems.map(item =>
                prisma.coins.create({
                    data: {
                        bin: item[0],
                        hype: item[1],
                        hours: item[2],
                    },
                })
            )
        );
        console.log('Unique data successfully saved to the database');
    } catch (error) {
        console.error('Error saving data to the database:', error);

    }
}

export async function saveSettingstoBd(arr: string[][], prisma: any) {
    for (const [key, value] of arr) {
        await prisma.settings.upsert({
            where: { key }, // Ищем запись по ключу
            update: { value: parseFloat(value) }, // Обновляем, если найдена
            create: { key, value: parseFloat(value) } // Создаём, если не найдена
        });
    }
}
export async function saveFavoritesToBd(coin: string, prisma: any) {
    if (coin) { }
    await prisma.favorites.upsert({
        where: { coin }, // Ищем запись по ключу
        update: { coin: coin }, // Обновляем, если найдена
        create: { coin: coin } // Создаём, если не найдена
    });

}
export async function deleteFavoritesfromBd(coin: string, prisma: any) {

    await prisma.favorites.delete({
        where: { coin: coin }, // Ищем запись по ключу
        // Создаём, если не найдена
    });
}
export async function getFavorites(prisma: any) {
    const coins = await prisma.favorites.findMany({
        select: { coin: true }
    })
    const coinNames = coins.map(c => c.coin);

    const coinsData = await prisma.coins.findMany({
        where: {
            hype: { in: coinNames } // Фильтр по массиву монет
        },
        select: { bin: true, hype: true, hours: true }
    });

    const BD = await prisma.fundings.findMany({
        where: {
            coin: { in: coinNames }
            // Фильтруем по массиву монет
        },

    });

    const order = ['1Day', '3Days', '7Days', '14Days', '30Days', '60Days'];
    const settings = await prisma.settings.findMany({
        select: { key: true, value: true }
    })
    const koef = settings
        .filter(setting => order.includes(setting.key)) // Берём только нужные ключи
        .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)) // Сортируем по `order`
        .map(setting => setting.value); // Оставляем только `value`

    const formattedCoins: string[][] = coinsData.map(c => [c.bin, c.hype, c.hours]);


    const result = parseALL(BD, formattedCoins)
    const calc = calcBest(result, koef)
    return [result, calc]

}



export function calcBestToFront(result: IAllBdResult[], calc: IcalcBest[]) {
    const filteredArray = result.filter(singleCoin =>
        calc.some(data =>
            data.coin === singleCoin.coin &&
            data.days1goodORbad === "GOOD" &&
            data.days3goodORbad === "GOOD" &&
            data.days7goodORbad === "GOOD"
        )
    );
    const calcRes = calc.filter(coin =>
        filteredArray.some(data =>
            data.coin === coin.coin
        )
    )

    // const Filtered = filteredArray
    //     .map(element => ({
    //         coin: element.coin,
    //         last1Day: element.last1Day,
    //         last3Days: element.last3Days,
    //         last7Days: element.last7Days,
    //         last14Days: element.last14Days,
    //         last30Days: element.last30Days,
    //         last60Days: element.last60Days,
    //     }))
    return { filteredArray, calcRes }

}

export async function getSingle(coin: string, prisma: any) {

    const coinsData = await prisma.coins.findMany({
        where: {
            hype: coin // Фильтр по массиву монет
        },
        select: { bin: true, hype: true, hours: true }
    });

    const BD = await prisma.fundings.findMany({
        where: {
            coin: coin
            // Фильтруем по массиву монет
        },

    });

    const formattedCoins: string[][] = coinsData.map(c => [c.bin, c.hype, c.hours]);
    const parse = await getKoef(prisma)
    const result = parseALL(BD, formattedCoins)
    const calc = calcBest(result, parse.koef)
    return [result, calc]

}

export async function getCoins(prisma: any) {
    const arr = await prisma.coins.findMany({
        select: { hype: true }
    });
    return (arr.map(el => el.hype))
}

export async function getSettings(prisma: any) {
    return await prisma.settings.findMany({
        select: { key: true, value: true }
    });

}
export async function getKoef(prisma: any) {
    const order = ['1Day', '3Days', '7Days', '14Days', '30Days', '60Days'];
    const parse = await prisma.settings.findMany({
        select: { key: true, value: true }
    })
    const settings = parse
        .filter(setting => order.includes(setting.key)) // Берём только нужные ключи
        .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)) // Сортируем по `order`
        .map(setting => ({ key: setting.key, value: setting.value })); // Оставляем только `value`
    const koef = settings.map(value => value.value)

    return ({ koef, settings })

}