import { IsIn, IsOptional } from 'class-validator';

export class UpdateBankAccountDto {
    
    @IsOptional()
    default_for_currency: boolean;

    @IsOptional()
    account_holder_name: string;

    @IsOptional()
    @IsIn(['individual', 'company'])
    account_holder_type: string;

}