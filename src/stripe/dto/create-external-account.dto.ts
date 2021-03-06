import { IsIn, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class CreateExternalAccountDto {
    @IsNotEmpty()
    @IsIn(['bank_account', 'card'])
    object: string;

    @ValidateIf(request => request.object === 'bank_account')
    @IsNotEmpty()
    country: string;

    @IsNotEmpty()
    currency: string;

    @ValidateIf(request => request.object === 'bank_account')
    @IsNotEmpty()
    account_number: string;

    @ValidateIf(request => request.object === 'bank_account')
    @IsOptional()
    routing_number: string;

    @ValidateIf(request => request.object === 'bank_account')
    @IsOptional()
    account_holder_name: string;

    @ValidateIf(request => request.object === 'bank_account')
    @IsOptional()
    default_for_currency: boolean;

    @ValidateIf(request => request.object === 'bank_account')
    @IsOptional()
    @IsIn(['individual', 'company'])
    account_holder_type: string;

    @ValidateIf(request => request.object === 'card')
    @IsNotEmpty()
    number: number;

    @ValidateIf(request => request.object === 'card')
    @IsNotEmpty()
    exp_month: number;

    @ValidateIf(request => request.object === 'card')
    @IsNotEmpty()
    exp_year: number;

    @ValidateIf(request => request.object === 'card')
    @IsNotEmpty()
    cvc: string;

    @ValidateIf(request => request.object === 'card')
    @IsNotEmpty()
    name: string;
}
