import { Body, Controller, Get, Post, UseGuards,Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../../../general/public.decorator';
import { AuthLoginDto } from '../../dto/auth-login.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth/jwt-auth.guard';
import { LocalAuthGuard } from '../../guards/local-auth/local-auth.guard';
import { AuthService } from '../../services/auth/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(@Body() authLoginDto: AuthLoginDto) {
        return this.authService.login(authLoginDto);
    }

    
}
