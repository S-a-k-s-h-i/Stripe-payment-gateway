import { IsOptional } from 'class-validator';

export class UpdateCardDto {

    @IsOptional()
    default_source: boolean;

    @IsOptional()
    address_city: string;

    @IsOptional()
    address_country: string;
    
    @IsOptional()
    address_line1: string;

    @IsOptional()
    address_line2: string;

    @IsOptional()
    address_state: string;

    @IsOptional()
    address_zip: string;

    @IsOptional()
    exp_month: number;

    @IsOptional()
    exp_year: number;

    @IsOptional()
    name: string;
}
