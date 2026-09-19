import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomTypeDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerNight?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number | null;

  @IsArray()
  @IsString({ each: true })
  features!: string[];
}
