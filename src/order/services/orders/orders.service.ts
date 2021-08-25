import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StripeService } from '../../../stripe/services/stripe/stripe.service';
import { User } from '../../../user/entities/user.entity';
import { UserService } from '../../../user/services/user/user.service';
import { CreateOrderDto } from '../../dto/create-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        private readonly stripeService:StripeService,
        private readonly userService:UserService
    ){}

    //Method to create order
    async createOrder(
        createOrderDto:CreateOrderDto,
        userDto:User
    ){  
        const buyer = await this.userService.findById(userDto.id);
        const payment = await this.stripeService.acceptPayment({
            amount: ((createOrderDto.amount)* 100).toFixed(),
            currency: 'usd',
            payment_method: createOrderDto.payment_method_token['id'],
            confirm: true,
            customer: buyer.customer_id,
            application_fee_amount: 200,
            transfer_data: {
                destination: createOrderDto.seller_account_id,
            },
            });
    
            if (payment.status !== 'succeeded') {
                throw new HttpException(
                'Payment Failed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
            }
    }
}
