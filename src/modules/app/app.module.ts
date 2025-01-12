import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/configuration';
import { TokenModule } from '../token/token.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration]
  }),
    TokenModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
