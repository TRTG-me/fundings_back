import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PassportModule } from '@nestjs/passport';
import { session } from 'passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'jwt',
            property: 'user',
            session: false,
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('secret_jwt'),
                signOptions: { expiresIn: configService.get<string>('expireJwt') }
            }),
            inject: [ConfigService]
        }),
    ],
    providers: [TokenService, JwtService],
    exports: [TokenService]
})
export class TokenModule { }
