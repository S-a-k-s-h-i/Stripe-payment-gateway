import { HttpException, HttpStatus, Injectable} from '@nestjs/common';
import Stripe from 'stripe';
import { User } from '../../../user/entities/user.entity';
import { UserService } from '../../../user/services/user/user.service';
import { CreateAccountDto } from '../../dto/create-account.dto';

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
            });
            await this.userService.updateOne({
                id: userDto.id,
                account_id: account.id,
            });

            // create account link
            return await this.createAccountLink(account.id, 'account_onboarding');
        }catch(e){
            console.log(e.message);
            throw new HttpException(
            'Failed to create Stripe Account',
            HttpStatus.INTERNAL_SERVER_ERROR,
            );
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
        throw new HttpException(
        'Failed to create Account link',
        HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
    }
    
    //method to get account detail
    async getAccountDetail(userDto:User):Promise<any>{
        try{
            const user = await this.userService.findById(userDto.id);
            const acc= await this.stripe.accounts.retrieve(user.account_id);
        }catch(e){
            console.log(e.message)
            throw new HttpException(
                'stripe account not found',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
