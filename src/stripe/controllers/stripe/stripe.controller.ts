import { Body, Controller, Get, Post,Query,Render,Request, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth/jwt-auth.guard';
import { Public } from '../../../general/public.decorator';
import { Roles } from '../../../general/roles.decorator';
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
    @Roles('seller')
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
    
    @Public()
    @Get('/success')
    @Render('stripe-success')
    async StripeSuccessTemplate():Promise<string[]>{
        return []
    }
    
    @Public()
    @Get('/refresh')
    async refreshAccountLink(@Query('id') id: string, @Res() res) {
        const accountLink = await this.stripeService.createAccountLink(
        id,
        'account_onboarding',
        );
        res.redirect(accountLink.url.toString());
    }

    // @Roles('seller')
    // @Get()
    // roleCheck(@Request() req){
    //     return req.user
    // }

    @Roles('seller')
    @Get('/account-details')
    async getAccountDetails(@Request() req){
        const account = await this.stripeService.getAccountDetail(req.user);
        return [
            'Stripe account fetched successfully',
            account
        ]
    }
}
