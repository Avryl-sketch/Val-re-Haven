import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  reservationId!: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
