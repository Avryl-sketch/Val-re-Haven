import { IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateInvoiceItemDto {
  @IsUUID()
  invoiceId!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}
