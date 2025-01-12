import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }
    public async generateJwtToken(user): Promise<string> {
        const payload = { user };
        return this.jwtService.sign(payload, {
            secret: this.configService.get('secret_jwt'),
            expiresIn: this.configService.get('expireJwt'),

        })
    }
}
