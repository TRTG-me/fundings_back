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
    console.log(arr)
    for (const [key, value] of arr) {
        await prisma.settings.upsert({
            where: { key }, // Ищем запись по ключу
            update: { value: parseFloat(value) }, // Обновляем, если найдена
            create: { key, value: parseFloat(value) } // Создаём, если не найдена
        });
    }
}
