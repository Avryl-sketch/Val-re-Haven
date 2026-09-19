import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomAvailabilityQueryDto } from './dto/room-availability-query.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RoomsService {
	constructor(private readonly supabaseService: SupabaseService) {}

	private get query() {
		return this.supabaseService
			.getClient()
			.from('rooms')
			.select('*, room_types(*)');
	}

	async findAll() {
		const { data, error } = await this.query.order('floor').order('room_number');

		if (error) {
			throw error;
		}

		return data;
	}

	async findOne(id: string) {
		const { data, error } = await this.query.eq('id', id).single();

		if (error) {
			throw error;
		}

		return data;
	}

	async findByNumber(roomNumber: string) {
		const { data, error } = await this.query
			.eq('room_number', roomNumber)
			.single();

		if (error) {
			throw error;
		}

		return data;
	}

	async findByStatus(status: string) {
		const { data, error } = await this.query
			.eq('status', status)
			.order('floor')
			.order('room_number');

		if (error) {
			throw error;
		}

		return data;
	}

	async findAvailable(query: RoomAvailabilityQueryDto) {
		if (query.checkOut <= query.checkIn) {
			throw new BadRequestException('checkOut must be after checkIn.');
		}

		const { data: maintenanceRows, error: maintenanceError } = await this.supabaseService
			.getClient()
			.from('maintenance_records')
			.select('room_id')
			.in('status', ['SCHEDULED', 'IN_PROGRESS'])
			.lt('start_date', query.checkOut)
			.gt('expected_end_date', query.checkIn);

		if (maintenanceError) {
			throw maintenanceError;
		}

		let reservationQuery = this.supabaseService
			.getClient()
			.from('reservations')
			.select('room_id')
			.in('status', ['PENDING', 'CONFIRMED', 'CHECKED_IN'])
			.lt('check_in', query.checkOut)
			.gt('check_out', query.checkIn)
			.not('room_id', 'is', null);

		if (query.excludeReservationId) {
			reservationQuery = reservationQuery.neq('id', query.excludeReservationId);
		}

		const { data: reservationRows, error: reservationError } = await reservationQuery;

		if (reservationError) {
			throw reservationError;
		}

		const blockedRoomIds = [
			...maintenanceRows.map((row) => row.room_id),
			...(reservationRows ?? []).map((row) => row.room_id),
		].filter((roomId): roomId is string => Boolean(roomId));
		let request = this.supabaseService
			.getClient()
			.from('rooms')
			.select('*, room_types(*)')
			.in('status', ['AVAILABLE', 'CLEAN'])
			.order('floor')
			.order('room_number');

		if (blockedRoomIds.length > 0) {
			request = request.not('id', 'in', `(${blockedRoomIds.join(',')})`);
		}

		if (query.roomTypeId) {
			request = request.eq('room_type_id', query.roomTypeId);
		}

		const { data, error } = await request;

		if (error) {
			throw error;
		}

		return {
			checkIn: query.checkIn,
			checkOut: query.checkOut,
			roomTypeId: query.roomTypeId ?? null,
			rooms: data,
			reservationConflictsChecked: true,
			maintenanceConflictsChecked: true,
		};
	}

	async create(dto: CreateRoomDto) {
		const { data, error } = await this.supabaseService
			.getClient()
			.from('rooms')
			.insert({
				room_number: dto.roomNumber,
				room_type_id: dto.roomTypeId,
				floor: dto.floor,
				status: dto.status,
				notes: dto.notes,
			})
			.select('*, room_types(*)')
			.single();

		if (error) {
			throw error;
		}

		return data;
	}

	async update(id: string, dto: UpdateRoomDto) {
		const updates = {
			...(dto.roomNumber !== undefined && { room_number: dto.roomNumber }),
			...(dto.roomTypeId !== undefined && { room_type_id: dto.roomTypeId }),
			...(dto.floor !== undefined && { floor: dto.floor }),
			...(dto.status !== undefined && { status: dto.status }),
			...(dto.notes !== undefined && { notes: dto.notes }),
			updated_at: new Date().toISOString(),
		};

		const { data, error } = await this.supabaseService
			.getClient()
			.from('rooms')
			.update(updates)
			.eq('id', id)
			.select('*, room_types(*)')
			.single();

		if (error) {
			throw error;
		}

		return data;
	}

	async remove(id: string) {
		const { error } = await this.supabaseService
			.getClient()
			.from('rooms')
			.delete()
			.eq('id', id);

		if (error) {
			throw error;
		}

		return { deleted: true, id };
	}
}
