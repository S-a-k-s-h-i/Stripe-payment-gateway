import { HttpException, HttpStatus, Injectable} from '@nestjs/common';
import Stripe from 'stripe';
import { User } from '../../../user/entities/user.entity';
import { UserService } from '../../../user/services/user/user.service';
import { CreateAccountDto } from '../../dto/create-account.dto';
import { CreateExternalAccountDto } from '../../dto/create-external-account.dto';
import { GetExternalAccountListDto } from '../../dto/get-external-account-list.dto';
import { UpdateExternalAccountDto } from '../../dto/update-external-account.dto';

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
    
}
