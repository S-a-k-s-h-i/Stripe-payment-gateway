import { Body, Controller, Post,Request } from '@nestjs/common';
import { Roles } from '../../../general/roles.decorator';
import { UserService } from '../../../user/services/user/user.service';
import { CreateOrderDto } from '../../dto/create-order.dto';
import { OrdersService } from '../../services/orders/orders.service';

@Controller('order')
export class OrdersController {
    constructor(
        private readonly userService:UserService,
        private readonly orderService:OrdersService
    ){}
    
    // API to create new order
    @Roles('buyer')
    @Post('/create')
    async createOrder(
        @Body() createOrderDto: CreateOrderDto,
        @Request() req
    ){
        await this.orderService.createOrder(createOrderDto,req.user);
        return ['Order successfully created']

    }
}
