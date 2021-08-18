import { Body, Controller, Get, Post,Query,Render,Request, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth/jwt-auth.guard';
import { UserService } from '../../../user/services/user/user.service';
import { CreateAccountDto } from '../../dto/create-account.dto';
import { StripeService } from '../../services/stripe/stripe.service';

@Controller('stripe')
export class StripeController {
    constructor(
        private readonly userService:UserService,
        private readonly stripeService:StripeService
    ){}

    // API to onboard user with stripe
    @UseGuards(JwtAuthGuard)
    @Post('/onboard')
    async createAccount(
        @Body() createAccountDto: CreateAccountDto,
        @Request() req,
    ): Promise<string[]> {
        const account = await this.stripeService.createAccount(
        createAccountDto,
        req.user,
        );
        return [
        'Stripe account created successfully',
        account,
    ];
    }

    @Get('/success')
    @Render('stripe-success')
    async StripeSuccessTemplate():Promise<string[]>{
        return []
    }

    @Get('stripe/refresh')
    async refreshAccountLink(@Query('id') id: string, @Res() res) {
        const accountLink = await this.stripeService.createAccountLink(
        id,
        'account_onboarding',
        );
        res.redirect(accountLink.url.toString());
    }
}
