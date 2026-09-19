import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateMaintenanceDto {
  @IsUUID()
  roomId!: string;

  @IsString()
  reason!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  expectedEndDate!: string;

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
