import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from 'src/common/dto/user';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    @Post('register')
    registerUser(@Body() dto: CreateUserDto) {
        return this.authService.registerUser(dto)
    }
    @Get('login')
    loginUser(@Body() dto: LoginUserDto) {
        return this.authService.loginUser(dto)
    }
}
