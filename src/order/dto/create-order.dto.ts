import { IsNotEmpty } from "class-validator";

export class CreateOrderDto{
    @IsNotEmpty()
    amount:number;
    
    @IsNotEmpty()
    payment_method_token: string;

    @IsNotEmpty()
    seller_account_id:string;
}