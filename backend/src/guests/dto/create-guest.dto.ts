import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGuestDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  identificationReference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
