import { Body, Controller, Delete, Get, Param, Patch, Post,Query,Render,Request, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth/jwt-auth.guard';
import { Public } from '../../../general/public.decorator';
import { Roles } from '../../../general/roles.decorator';
import { UserService } from '../../../user/services/user/user.service';
import { CreateAccountDto } from '../../dto/create-account.dto';
import { CreateExternalAccountDto } from '../../dto/create-external-account.dto';
import { CreatePaymentMethodDto } from '../../dto/create-paymentMethod.dto';
import { DeletePaymentMethodDto } from '../../dto/delete-paymentMethod.dto';
import { GetExternalAccountListDto } from '../../dto/get-external-account-list.dto';
import { GetPaymentMethodListDto } from '../../dto/get-paymentMethod-list.dto';
import { OnboardAccountLinkDto } from '../../dto/onboard-account-link.dto';
import { UpdateExternalAccountDto } from '../../dto/update-external-account.dto';
import { UpdatePaymentMethodDto } from '../../dto/update-paymentMethod.dto';
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

    @Roles('seller')
    @Get('/account-details')
    async getAccountDetails(@Request() req){
        const account = await this.stripeService.getAccountDetail(req.user);
        return [
            'Stripe account fetched successfully',
            account
        ]
    }

    @Roles('seller')
    @Post('/account/onboard')
    async accountOnboarding(
        @Body() onboardAccountDto: OnboardAccountLinkDto,
    ) {
        const accountLink = await this.stripeService.createAccountLink(
        onboardAccountDto.id,
        'account_onboarding',
        );
        return [
        'Account link successfully created',
        accountLink,
        ] ;
    }
    
    //API to update onboard account
    @Roles('seller')
    @Post('/account/update')
    async updateAccount(
        @Body() onboardAccountUpdateDto: OnboardAccountLinkDto,
    ) {
        const accountLink = await this.stripeService.createAccountLink(
            onboardAccountUpdateDto.id,
            'account_update',
        );
        return [
        'Account Link successfully created for Account Updation',
        accountLink,
        ];
    }

    //API to create external account
    @Roles('seller')
    @Post('/external-account')
    async createExternalAccount(
        @Body() createExternalAccountDto: CreateExternalAccountDto,
        @Request() req,
    ): Promise<(string | unknown)[]> {
    const externalAccount = await this.stripeService.createExternalAccount(
        createExternalAccountDto,
        req.user,
    );
    return [
        'External account created successfully',
        externalAccount,
    ];
    }
    
    //API for deleting external account for seller
    @Roles('seller')
    @Delete('/external-account/:id')
    async deleteExternalAccount(
        @Param('id') id: string,
        @Request() req,
    ): Promise<string[]> {
        await this.stripeService.deleteExternalAccount(id, req.user);
        return [
            'External Account Deleted successfully'
        ];
    }
    
    //API to get the details of seller external account
    @Roles('seller')
    @Get('/external-account/:id')
    async getExternalAccount(
        @Param('id') id: string,
        @Request() req,
    ): Promise<(string | unknown)[]> {
        const externalAccount = await this.stripeService.getExternalAccount(
            id,
            req.user,
        );
        return [
        'External account fetched successfully',
        externalAccount,
        ];
    }
    
    //API to update seller external account
    @Roles('seller')
    @Patch('/external-account/update')
    async updateExternalAccount(
        @Body() updateExternalAccountDto: UpdateExternalAccountDto,
        @Request() req,
    ): Promise<(string | unknown)[]> {
        const externalAccount = await this.stripeService.updateExternalAccount(
        updateExternalAccountDto,
        req.user,
        );
        return [
        'External Account Updated Successfully',
        externalAccount,
        ];
    }

    //API to get seller external account list
    @Roles('seller')
    @Get('/external-accounts')
    async getExternalAccountList(
        @Query() getExternalAccountListDto: GetExternalAccountListDto,
        @Request() req,
    ): Promise<(string | unknown)[]> {
        const externalAccount = await this.stripeService.getExternalAccountList(
        getExternalAccountListDto,
        req.user,
        );
        return [
            'Successfully fetched the External Account',
            externalAccount,
        ];
    }
    
    //API to create payment method
    @Roles('buyer', 'seller')
    @Post('/paymentMethod')
    async createPaymentMethod(
        @Body() createpaymentMethodDto: CreatePaymentMethodDto,
        @Request() req,
    ): Promise<(string | unknown)[]> {
        const paymentMethod = await this.stripeService.createPaymentMethod(
        createpaymentMethodDto,
        req.user,
        );
        return [
            'Payment method successfully Added',
            paymentMethod,
        ];
    }
    
    //API to detach a payment method from customer
    @Roles('buyer', 'seller')
    @Delete('/paymentMethod')
    async deletePaymentMethod(
        @Body() deletePaymentMethodDto: DeletePaymentMethodDto,
    ): Promise<string[]> {
        await this.stripeService.deletePaymentMethod(deletePaymentMethodDto);
        return [
        'Payment method deleted successfully'
        ];
    }

    @Roles('buyer', 'seller')
    @Patch('/paymentMethod')
    async updatePaymentMethod(
        @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
    ): Promise<(string | unknown)[]> {
        const paymentMethod = await this.stripeService.updatePaymentMethod(
        updatePaymentMethodDto
        );
        return [
        'Payment method updated successfully',
        paymentMethod,
        ];
    }

    @Roles('buyer', 'seller')
    @Get('/paymentMethod/:paymentMethod_id')
    async getPaymentMethodDetail(
        @Param('paymentMethod_id') paymentMethod_id: string
    ): Promise<(string | unknown)[]> {
        const paymentMethod = await this.stripeService.getPaymentMethodDetail(paymentMethod_id);
        return [
        'payment method fetched successfully',
        paymentMethod,
        ];
    }

    @Roles('buyer', 'seller')
    @Get('/paymentMethod')
    async getPaymentList(
        @Query() getPaymentMethodListDto:GetPaymentMethodListDto,
        @Request() req,
    ): Promise<(string | unknown)[]> {
        const paymentMethod = await this.stripeService.getPaymentMethodList(
        getPaymentMethodListDto,
        req.user,
        );
        return [
        'Successfully fetched customer payment methods',
        paymentMethod,
        ];
    }
    
    }