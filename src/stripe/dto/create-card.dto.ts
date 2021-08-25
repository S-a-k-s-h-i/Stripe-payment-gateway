import { IsNotEmpty} from 'class-validator';

export class CreateCardDto {
    @IsNotEmpty()
    number: number;

    @IsNotEmpty()
    exp_month: number;

    @IsNotEmpty()
    exp_year: number;

    @IsNotEmpty()
    cvc: string;
}
