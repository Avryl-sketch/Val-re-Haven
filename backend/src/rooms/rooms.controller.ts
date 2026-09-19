import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseEnumPipe,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { CreateRoomDto, RoomStatus } from './dto/create-room.dto';
import { RoomAvailabilityQueryDto } from './dto/room-availability-query.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

	@Get()
	findAll() {
		return this.roomsService.findAll();
	}

	@Get('availability')
	findAvailable(@Query() query: RoomAvailabilityQueryDto) {
		return this.roomsService.findAvailable(query);
	}

	@Get('number/:roomNumber')
	findByNumber(@Param('roomNumber') roomNumber: string) {
		return this.roomsService.findByNumber(roomNumber);
	}

	@Get('status/:status')
	findByStatus(
		@Param('status', new ParseEnumPipe(RoomStatus)) status: RoomStatus,
	) {
		return this.roomsService.findByStatus(status);
	}

	@Get(':id')
	findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.roomsService.findOne(id);
	}

	@Post()
	create(@Body() dto: CreateRoomDto) {
		return this.roomsService.create(dto);
	}

	@Patch(':id')
	update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateRoomDto,
	) {
		return this.roomsService.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id', ParseUUIDPipe) id: string) {
		return this.roomsService.remove(id);
	}
}
