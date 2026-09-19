import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { HousekeepingStatus } from './dto/housekeeping-status.enum';
import { UpdateHousekeepingStatusDto } from './dto/update-housekeeping-status.dto';
import { HousekeepingService } from './housekeeping.service';

@Controller('housekeeping')
export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  @Get('rooms')
  findRooms() {
    return this.housekeepingService.findRooms();
  }

  @Get('rooms/status/:status')
  findRoomsByStatus(
    @Param('status', new ParseEnumPipe(HousekeepingStatus))
    status: HousekeepingStatus,
  ) {
    return this.housekeepingService.findRoomsByStatus(status);
  }

  @Get('rooms/:roomId/history')
  findHistory(@Param('roomId', ParseUUIDPipe) roomId: string) {
    return this.housekeepingService.findHistory(roomId);
  }

  @Post('rooms/:roomId/status')
  updateStatus(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Body() dto: UpdateHousekeepingStatusDto,
  ) {
    return this.housekeepingService.updateStatus(roomId, dto);
  }
}
