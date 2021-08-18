import { Body, Controller, Get,  Post,Request } from '@nestjs/common';
import { Public } from '../../../general/public.decorator';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UserService } from '../../services/user/user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService:UserService){}
    
    @Public()
    @Post('/new')
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.createOne(createUserDto);
    }
    
    @Get('/Profile')
    async getProfile(@Request() req) {
        return req.user;
    }
}
