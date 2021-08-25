import { IsNotEmpty } from 'class-validator';

export class OnboardAccountLinkDto {
    @IsNotEmpty()
    id: string;
}
