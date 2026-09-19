import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CreateReservationDto,
  ReservationStatus,
} from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CheckInDto } from './dto/check-in.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { StaffRole } from '../auth/roles.enum';
import { AuthenticatedUser } from '../auth/auth.service';
import { AssignRoomDto } from './dto/assign-room.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.STAFF)
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('status/:status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.STAFF)
  findByStatus(
    @Param('status', new ParseEnumPipe(ReservationStatus))
    status: ReservationStatus,
  ) {
    return this.reservationsService.findByStatus(status);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.STAFF)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.STAFF)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, dto);
  }

  @Get(':id/available-rooms')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.STAFF)
  availableRooms(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.availableRooms(id);
  }

  @Patch(':id/room')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.STAFF)
  assignRoom(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRoomDto,
  ) {
    return this.reservationsService.update(id, { roomId: dto.roomId });
  }

  @Post(':id/check-in')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.STAFF)
  checkIn(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CheckInDto,
    @Req() request: { user?: AuthenticatedUser },
  ) {
    return this.reservationsService.checkIn(id, dto, request.user?.id);
  }

  @Post(':id/check-out')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.OWNER, StaffRole.ADMIN, StaffRole.RECEPTIONIST, StaffRole.STAFF)
  checkOut(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: { user?: AuthenticatedUser },
  ) {
    return this.reservationsService.checkOut(id, request.user?.id);
  }
}
