import { Body, Controller, Get, Post, UseGuards,Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthLoginDto } from '../../dto/auth-login.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth/jwt-auth.guard';
import { AuthService } from '../../services/auth/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @UseGuards(AuthGuard('local'))
    @Post('/login')
    async login(@Body() authLoginDto: AuthLoginDto) {
        return this.authService.login(authLoginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('Profile')
    async getProfile(@Request() req) {
        return req.user;
    }
}
