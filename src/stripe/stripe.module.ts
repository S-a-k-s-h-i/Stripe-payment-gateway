import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { StripeController } from './controllers/stripe/stripe.controller';
import { StripeService } from './services/stripe/stripe.service';

@Module({
  imports:[UserModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports:[StripeService]
})
export class StripeModule {}
