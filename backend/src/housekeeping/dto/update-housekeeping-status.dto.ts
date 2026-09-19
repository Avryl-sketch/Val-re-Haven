import { IsEnum, IsOptional, IsString } from 'class-validator';
import { HousekeepingStatus } from './housekeeping-status.enum';

export class UpdateHousekeepingStatusDto {
  @IsEnum(HousekeepingStatus)
  status!: HousekeepingStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
