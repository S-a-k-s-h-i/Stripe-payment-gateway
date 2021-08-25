import { Type } from "class-transformer";
import { IsIn, IsNotEmpty, ValidateIf, ValidateNested } from "class-validator";
import { UpdateCardDto } from "./update-card.dto";

export class UpdatePaymentMethodDto {
    @IsNotEmpty()
    paymentMethod_id: string;

    @IsNotEmpty()
    @IsIn(['bank_account', 'card'])
    object: string;

    @ValidateIf(request => request.object === 'card')
    @ValidateNested({ each: true })
    @Type(() => UpdateCardDto)
    @IsNotEmpty()
    card: UpdateCardDto;
}