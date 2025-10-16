import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/configuration';
import { TokenModule } from '../token/token.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { HypeModule } from '../hype/hype.module';
import { ProxiModule } from '../proxi/proxi.module';
import { BinapiModule } from '../binapi/binapi.module';
import { GetInfoModule } from '../get-info-paradex/get-info.module';
import { GetInfoExtendModule } from '../get-info-extend/get-info-extend.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration]
  }),
    TokenModule,
    AuthModule,
    UsersModule,
    HypeModule,
    ProxiModule,
    BinapiModule,
    GetInfoModule,
    GetInfoExtendModule
  ],

  controllers: [],
  providers: [],
})
export class AppModule { }
