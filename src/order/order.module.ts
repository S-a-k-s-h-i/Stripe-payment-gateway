import { Module } from '@nestjs/common';
import { StripeModule } from '../stripe/stripe.module';
import { UserModule } from '../user/user.module';
import { OrdersController } from './controllers/orders/orders.controller';
import { OrdersService } from './services/orders/orders.service';

@Module({
  imports:[StripeModule,UserModule],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrderModule {}
