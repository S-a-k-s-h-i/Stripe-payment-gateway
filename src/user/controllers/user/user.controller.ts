import { Body, Controller, Get, Param, Post,Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UserService } from '../../services/user/user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService:UserService){}

    @Post('/new')
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.createOne(createUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/test')
    async test(@Request() req) {
        return req.user;
    }
}
