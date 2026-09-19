import { IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  reservationId!: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositApplied?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
