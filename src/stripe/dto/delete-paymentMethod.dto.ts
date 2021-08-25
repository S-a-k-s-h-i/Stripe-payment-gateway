import { IsNotEmpty } from 'class-validator';

export class DeletePaymentMethodDto {
    @IsNotEmpty()
    paymentMehod_id: string;
}
