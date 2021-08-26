import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { CreateCardDto } from './create-card.dto';

export class CreatePaymentMethodDto {
    @IsNotEmpty()
    @IsIn(['bank_account', 'card'])
    object: string;

    @ValidateIf(request => request.object === 'card')
    @ValidateNested({ each: true })
    @Type(() => CreateCardDto)
    @IsNotEmpty()
    card: CreateCardDto;
}