import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { HypeService } from './hype.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma/prisma.service';
import { deleteFavoritesfromBd, getCoins, getFavorites, getKoef, getSettings, getSingle, saveCoinstoBd, saveFavoritesToBd, saveSettingstoBd } from 'src/helpers/functions2';

@Controller('')
export class HypeController {
    constructor(private readonly hypeService: HypeService,
        private readonly prisma: PrismaService
    ) { }

    @Post('refresh')
    async getFundingRate(@Body() body: { days: number, updatedSettings: { key: string, value: string }[] }) {
        const settings = body.updatedSettings.map(value => [value.key, value.value])
        await saveSettingstoBd(settings, this.prisma)
        return this.hypeService.hypeFundingRate(body.days);
    }
    @Get('deleteBD')
    async deleteTable() {
        return await this.hypeService.deleteTable();
    }
    @Get('getBD')
    async getAllBd() {
        return await this.hypeService.startBD();
    }
    @Post('uploadCoins')
    @UseInterceptors(FileInterceptor('file'))
    async uploadCoinsFile(@UploadedFile() file: Express.Multer.File) {
        const result = this.hypeService.txtToArray(file.buffer.toString());
        await saveCoinstoBd(result, this.prisma)
    }

    @Post('uploadSettings')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const result = this.hypeService.txtToArray(file.buffer.toString());
        console.log(result)
        await saveSettingstoBd(result, this.prisma)
    }
    @Post('addFavor')
    async saveFavorites(@Body() body: { coin: string }) {
        saveFavoritesToBd(body.coin, this.prisma);
    }
    @Post('deleteFavor')
    async deleteFavoritesfromBd(@Body() body: { coin: string }) {
        deleteFavoritesfromBd(body.coin, this.prisma);
    }

    @Get('getFavorites')
    async getFavorites() {
        return await getFavorites(this.prisma);
    }

    @Post('singleElement')
    async getSingleElement(@Body() body: { coin: string }) {
        return await getSingle(body.coin, this.prisma)
    }
    @Get('getCoins')
    async getCoins() {
        return await getCoins(this.prisma)

    }
    @Get('getSettings')
    async getSettings() {
        const parse = await getKoef(this.prisma)
        return parse.settings
    }
    @Get('getTest')
    async gettest() {
        return await this.hypeService.sdk()

    }
}



