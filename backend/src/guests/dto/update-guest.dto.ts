import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateGuestDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

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
