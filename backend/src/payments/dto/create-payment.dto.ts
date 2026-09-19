import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  IsUUID,
  Min,
} from 'class-validator';

export enum PaymentMethod {
  CREDIT_DEBIT_CARD = 'CREDIT_DEBIT_CARD',
  GCASH = 'GCASH',
  MAYA = 'MAYA',
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentRecordStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class CreatePaymentDto {
  @IsUUID()
  reservationId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

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
