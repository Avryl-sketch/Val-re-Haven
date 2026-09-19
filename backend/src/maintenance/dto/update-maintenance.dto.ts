import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { MaintenanceStatus } from './create-maintenance.dto';

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  expectedEndDate?: string;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
