import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class GetExternalAccountListDto {
    @IsNotEmpty()
    @IsIn(['bank_account', 'card'])
    object: string;

    @IsOptional()
    ending_before: string;

    @IsOptional()
    starting_after: string;

    @IsOptional()
    limit: string;
}
