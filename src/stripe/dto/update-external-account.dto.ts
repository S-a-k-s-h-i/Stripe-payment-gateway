import { Type } from "class-transformer";
import { IsIn, IsNotEmpty, ValidateIf, ValidateNested } from "class-validator";
import { UpdateBankAccountDto } from "./update-bank-account.dto";
import { UpdateCardDto } from "./update-card.dto";

export class UpdateExternalAccountDto {
    @IsNotEmpty()
    @IsIn(['bank_account', 'card'])
    object: string;

    @IsNotEmpty()
    external_account_id: string;

    @ValidateIf(request => request.object === 'bank_account')
    @ValidateNested({ each: true })
    @Type(() => UpdateBankAccountDto)
    @IsNotEmpty()
    bank_account: UpdateBankAccountDto;

    @ValidateIf(request => request.object === 'card')
    @ValidateNested({ each: true })
    @Type(() => UpdateCardDto)
    @IsNotEmpty()
    card: UpdateCardDto;
    }
