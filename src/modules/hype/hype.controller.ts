import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { HypeService } from './hype.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma/prisma.service';
import { deleteFavoritesfromBd, getFavorites, saveCoinstoBd, saveFavoritesToBd, saveSettingstoBd } from 'src/helpers/functions2';

@Controller('')
export class HypeController {
    constructor(private readonly hypeService: HypeService,
        private readonly prisma: PrismaService
    ) { }

    @Post('refresh')
    async getFundingRate(@Body() body: { days: number }) {

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
        await saveSettingstoBd(result, this.prisma)
    }
    @Post('addFavor')
    async saveFavorites(@Body() body: { coin: string }) {
        console.log(body)
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

}


