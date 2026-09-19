import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class RoomAvailabilityQueryDto {
  @IsDateString()
  checkIn!: string;

  @IsDateString()
  checkOut!: string;

  @IsOptional()
  @IsUUID()
  roomTypeId?: string;

  @IsOptional()
  @IsUUID()
  excludeReservationId?: string;
}
