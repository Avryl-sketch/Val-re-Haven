import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PaymentRecordStatus } from './create-payment.dto';

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentRecordStatus)
  status?: PaymentRecordStatus;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerReference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
