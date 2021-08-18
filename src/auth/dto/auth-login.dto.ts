import { IsNotEmpty } from 'class-validator';

export class AuthLoginDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    password: string;
}