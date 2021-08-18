import { IsNotEmpty } from 'class-validator';

export class CreateAccountDto {
    @IsNotEmpty()
    country: string;
}
