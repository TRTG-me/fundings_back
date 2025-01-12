import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from 'src/common/dto/user';
import { AppErrors } from 'src/common/errors';
import * as bcrypt from 'bcrypt'
import { APP_USER_FIELDS, USER_SELECT_FIELDS } from 'src/common/constants';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    public async createUser(dto: CreateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
        if (user) return new BadRequestException(AppErrors.USER_EXISTS);
        const salt = await bcrypt.genSalt();
        dto.password = await this.hashPassword(dto.password, salt)
        return this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: dto.password,
            },
            select: {
                ...USER_SELECT_FIELDS
            },
        })
    }
    private async hashPassword(password, salt) {
        return bcrypt.hash(password, salt)
    }
    public async getPublicUser(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                ...USER_SELECT_FIELDS
            }
        })
    }
    public async getUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            select: {
                ...APP_USER_FIELDS
            }
        })
    }
}


