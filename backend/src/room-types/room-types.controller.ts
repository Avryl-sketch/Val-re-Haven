import { Controller, Get, Param } from '@nestjs/common';
import { RoomTypesService } from './room-types.service';

@Controller('room-types')
export class RoomTypesController {
	constructor(private readonly roomTypesService: RoomTypesService) {}

	@Get()
	findAll() {
		return this.roomTypesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.roomTypesService.findOne(id);
	}
}
