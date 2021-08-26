import { HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Stripe from 'stripe';
import { User } from '../../../user/entities/user.entity';
import { UserService } from '../../../user/services/user/user.service';
import { CreateAccountDto } from '../../dto/create-account.dto';
import { CreateExternalAccountDto } from '../../dto/create-external-account.dto';
import { CreatePaymentMethodDto } from '../../dto/create-paymentMethod.dto';
import { DeletePaymentMethodDto } from '../../dto/delete-paymentMethod.dto';
import { GetExternalAccountListDto } from '../../dto/get-external-account-list.dto';
import { GetPaymentMethodListDto } from '../../dto/get-paymentMethod-list.dto';
import { UpdateExternalAccountDto } from '../../dto/update-external-account.dto';
import { UpdatePaymentMethodDto } from '../../dto/update-paymentMethod.dto';

@Injectable()
export class StripeService {
    private stripe: Stripe;
    constructor(
        private userService: UserService,
    ){
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2020-08-27',
        });
    }

    //method to create stripe account
    async createAccount(
        createAccountDto:CreateAccountDto,
        userDto:User
    ){
        try{
            const account = await this.stripe.accounts.create({
                type: 'custom',
                country: createAccountDto.country,
                capabilities: {
                card_payments: {requested: true},
                transfers: {requested: true},
                },
                settings: {
                    payouts: {
                        schedule: {
                            interval: 'manual',
                        }
                    },
                    },
            });
            await this.userService.updateOne({
                id: userDto.id,
                account_id: account.id,
            });

            // create account link
            return await this.createAccountLink(account.id, 'account_onboarding');
        }catch(e){
            console.log(e.message);
            if (e.type === 'StripeConnectionError') {
                throw new HttpException(
                    'Failed to create Stripe Account',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    );
            } else {
                throw new HttpException(e.message,e.statusCode);
            }
        }
    }

      // Create a link to send user to hosted form to fill identity verification details
    async createAccountLink(account: string, purpose: any): Promise<any> {
        try {
            return await this.stripe.accountLinks.create({
            account: account,
            refresh_url: `${process.env.STRIPE_REFRESH_URL}?id=${account}`,
            return_url: `${process.env.STRIPE_RETURN_URL}`,
            type: purpose,
        });
        } catch (e) {
        console.log(e.message);
        if (e.type === 'StripeConnectionError') {
            throw new HttpException(
                'Failed to create Account link',
                HttpStatus.INTERNAL_SERVER_ERROR,
                );
        } else {
            throw new HttpException(e.message,e.statusCode);
        }

    }
    }
    
    //method to get account detail
    async getAccountDetail(userDto:User):Promise<any>{
        try{
            const user = await this.userService.findById(userDto.id);
            return await this.stripe.accounts.retrieve(user.account_id);
        }catch(e){
            console.log(e.message)
            if (e.type === 'StripeConnectionError') {
                throw new HttpException(
                    'Failed to fetch stripe account',
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            } else {
                throw new HttpException(e.message,e.statusCode);
        }
        }
    }

    //method for creating external account for seller
    async createExternalAccount(
        createExternalAccountDto:CreateExternalAccountDto,
        userDto:User
    ):Promise<any>{
        try{
            const user = await this.userService.findById(userDto.id);
            const externalAccount = await this.stripe.accounts.createExternalAccount(
                user.account_id,
                {
                    external_account:
                    createExternalAccountDto.object === 'card'?
                    (await (this.createCardToken(createExternalAccountDto))).id: Object.assign({...createExternalAccountDto})
    
                }
            )
            return externalAccount;
        }catch(e){
            console.log(e.message);
            if (e.type === 'StripeConnectionError') {
                throw new HttpException(
                    'failed to create external account',
                    HttpStatus.INTERNAL_SERVER_ERROR
                )             
            } else {
                throw new HttpException(e.message,e.statusCode);
        }
        }
    }

    async createCardToken(createExternalAccountDto){
        try{
            return await this.stripe.tokens.create({
                card:{
                    number:createExternalAccountDto.number,
                    exp_month:createExternalAccountDto.exp_month,
                    exp_year:createExternalAccountDto.exp_year,
                    cvc:createExternalAccountDto.cvc,
                    currency:createExternalAccountDto.currency
                }
            })
        }catch(e){
            console.log(e.message)
            if (e.type === 'StripeConnectionError') {
                throw new HttpException(
                    'Failed to create card token',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            } else {
                throw new HttpException(e.message,e.statusCode);
        }
        }
    }

    // Method for deleting seller external account
    async deleteExternalAccount(id: string, userDto: User): Promise<any> {
    try {
        const user = await this.userService.findById(userDto.id);
        return await this.stripe.accounts.deleteExternalAccount(
            user.account_id,
            id,
        );
        } catch (e) {
            console.log(e.message)
            if (e.type === 'StripeConnectionError') {
                throw new HttpException(
                    'fAILED to delete External Account',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            } else {
                throw new HttpException(e.message,e.statusCode);
        }
    }
    }

    // Method to get seller external account 
    async getExternalAccount(id: string, userDto: User): Promise<any> {
    try {
        const user = await this.userService.findById(userDto.id);
        return await this.stripe.accounts.retrieveExternalAccount(
            user.account_id,
            id,
        );
    } catch (e) {
        console.log(e.message)
        if(e.type === 'StripeConnectionError'){
            throw new HttpException(
                'Failed to fetch external account',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );    
        }else{
            throw new HttpException(e.message,e.statusCode);
        }
    }
    }

    //Method to update seller external account
    async updateExternalAccount(
        updateExternalAccountDto: UpdateExternalAccountDto,
        userDto: User,
    ): Promise<any> {
        try {
            const user = await this.userService.findById(userDto.id);
            const externalAccountDetails =
                updateExternalAccountDto.object === 'card'
                ?Object.assign({ ...updateExternalAccountDto.card })
                :Object.assign({ ...updateExternalAccountDto.bank_account });
            
    
            return await this.stripe.accounts.updateExternalAccount(
                user.account_id,
                updateExternalAccountDto.external_account_id,
                externalAccountDetails,
            );
        } catch (e) {
            console.log(e.message);
            if(e.type === 'StripeConnectionError'){
                throw new HttpException(
                    'Failed to update External account',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    );
            }else{
                throw new HttpException(e.message,e.statusCode);
            }

        }
        }

    //Method to get list of seller external accounts
    async getExternalAccountList(
        getExternalAccountListDto: GetExternalAccountListDto,
        userDto: User,
        ): Promise<any> {
        try {
            const user = await this.userService.findById(userDto.id);
            return await this.stripe.accounts.listExternalAccounts(
            user.account_id,
            Object.assign({
                ...getExternalAccountListDto
            }),
            );
        } catch (e) {
            console.log(e.message)
            if(e.type === 'StripeConnectionError'){
                    throw new HttpException(
                    'Failed to fetch External Accounts',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    );
            }else{
                throw new HttpException(e.message,e.statusCode);
            }
        }
        }

     // Method to create customer in order to accept payments
    async createCustomer(userDto: User): Promise<any> {
        try {
            const customer = await this.stripe.customers.create({
                name: userDto.username,
                email: userDto.email,
        });

        await this.userService.updateOne({
            id: userDto.id,
            customer_id: customer.id,
        });

        return customer;
    } catch (e) {
        console.log(e.message)
        if(e.type === 'StripeConnectionError'){
                throw new HttpException(
                'Failed to create stripe customer',
                HttpStatus.INTERNAL_SERVER_ERROR,
                );
        }else{
            throw new HttpException(e.message,e.statusCode);
        }
    }
    }

    // Method to create payment method for customer to accept payment
    async createPaymentMethod(
    createpaymentMethodDto: CreatePaymentMethodDto,
    userDto: User,
    ): Promise<any> {
    try {
        const user = await this.userService.findById(userDto.id);
        const customer_id = user.customer_id
        ? user.customer_id
        : (await this.createCustomer(user)).id;

        const paymentMethod = await this.stripe.paymentMethods.create({
            type: 'card',
            card: Object.assign({...createpaymentMethodDto.card}),
            });
        return await this.stripe.paymentMethods.attach(
                paymentMethod.id,
                {customer: customer_id}
                );
    } catch (e) {
        console.log(e.message)
        if (e.type === 'StripeConnectionError') {
            throw new HttpException(
                'Payment creation method failed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        } else {
            throw new HttpException(e.raw.message, e.raw.statusCode);
        }
    }
    }

    // Method to detach payment method from customer
    async deletePaymentMethod(
        deletePaymentMethodDto: DeletePaymentMethodDto,
    ): Promise<any> {
    try {
        return await this.stripe.paymentMethods.detach(
            deletePaymentMethodDto.paymentMehod_id
        );
    } catch (e) {
        if (e.type === 'StripeConnectionError') {
            throw new HttpException(
                'Failed to delete payment method',
                HttpStatus.INTERNAL_SERVER_ERROR,
                );
        } else {
            throw new HttpException(e.raw.message, e.raw.statusCode);
        }
    }
    }

    // Method to update customer's payment method
    async updatePaymentMethod(
    updatePaymentMethodDto: UpdatePaymentMethodDto,
    ): Promise<any> {
    try {
        const updateData =
            updatePaymentMethodDto.object === 'card'
            ? Object.assign({ ...updatePaymentMethodDto.card })
            : null;
        return await this.stripe.paymentMethods.update(
                updatePaymentMethodDto.paymentMethod_id,
                updateData
            );
    } catch (e) {
        console.log(e.message)
        if (e.type === 'StripeConnectionError') {
            throw new HttpException(
                'Failed to update payment method',
                HttpStatus.INTERNAL_SERVER_ERROR,
                );
        } else {
            throw new HttpException(e.raw.message, e.raw.statusCode);
        }
    }
    }

    // Method to get customer's payment method details
    async getPaymentMethodDetail(paymenMethod_id: string): Promise<any> {
    try {
        return await this.stripe.paymentMethods.retrieve(
            paymenMethod_id
        );
    } catch (e) {
        console.log(e)
        console.log(e.message)
        if (e.type === 'StripeConnectionError') {
            throw new HttpException(
                'Failed to fetch payment method',
                HttpStatus.INTERNAL_SERVER_ERROR,
                );
        } else {
            throw new HttpException(e.raw.message, e.raw.statusCode);
        } 
    }
    }

    // Method to get list of customer's payment method
    async getPaymentMethodList(
        getPaymentMethodListDto: GetPaymentMethodListDto,
        userDto: User,
    ): Promise<any> {
    try {
        const user = await this.userService.findById(userDto.id);
        if (user.customer_id)
            return await this.stripe.paymentMethods.list(
            Object.assign({
            customer:user.customer_id,
            type: getPaymentMethodListDto.object,
            limit: getPaymentMethodListDto.limit ?? 10,
            starting_after: getPaymentMethodListDto.starting_after,
            ending_before: getPaymentMethodListDto.ending_before,
            }),
        );
        else return [];
    } catch (e) {
        console.log(e.message)
        if (e.type === 'StripeConnectionError') {
            throw new HttpException(
                'Failed to fetch customer payment methods',
                HttpStatus.INTERNAL_SERVER_ERROR,
                );
        } else {
            throw new HttpException(e.raw.message, e.raw.statusCode);
        } 
    }
}
    
    // Method to accept payment from customer
    async acceptPayment(paymentDto): Promise<any> {
        try {
        // Deduct payment from customer's payment method
        return await this.stripe.paymentIntents.create(paymentDto);
    } catch (e) {
        if (e.type === 'StripeConnectionError') {
            throw new HttpException(
                'Failed to create charge',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        } else {
            throw new HttpException(e.raw.message, e.raw.statusCode);
        }
    }
    }
    
    //Method to manually generate the payOuts
    @Cron('* 0 7 * * *', {
        name: 'Send Payouts',
        timeZone: 'America/New_York',
    })
    async generatePayOuts(){
        try{
            const payout = await this.stripe.payouts.create({
                amount:  (148* 100),
                currency: 'usd',
                }, {
                stripeAccount: 'acct_1JSL9rPAnao1x3Rm',
                });
                // If payout status
                console.log(payout.status);
            
        }catch(e){
            console.log(e.message)
        }

    }
    
    //Method to generate refunds
    @Cron('* 0 8 * * *', {
        name: 'Send Refunds',
        timeZone: 'America/New_York',
    })
    async generateRefunds(){
        const paymentIntentId='pi_3JSbRUASgjzARRhD1kHZaqjq'
        try{
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
            });
            //if refund succeeds
            if (refund.status && refund.status === 'succeeded'){
                const paymentIntent = await this.stripe.paymentIntents.retrieve(
                    paymentIntentId
                );
                await this.refundApplicationFee(
                        paymentIntent.charges.data[0].application_fee
                )
                console.log('refund successful')
            }
        }catch(e){
            console.log(e.message)
        }
    }
    
    //Method to refund application fees
    async refundApplicationFee(fees_id){
        try{
            return await this.stripe.applicationFees.createRefund(fees_id);
        }catch(e){
            console.log(e.message);
        }
    }
    }