import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  OCCUPIED = 'OCCUPIED',
  DIRTY = 'DIRTY',
  CLEAN = 'CLEAN',
  INSPECTION = 'INSPECTION',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export class CreateRoomDto {
  @IsString()
  roomNumber!: string;

  @IsUUID()
  roomTypeId!: string;

  @IsInt()
  @Min(1)
  floor!: number;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
