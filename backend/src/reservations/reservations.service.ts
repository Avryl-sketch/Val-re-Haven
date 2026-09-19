import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RoomsService } from '../rooms/rooms.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateReservationDto,
  ReservationStatus,
} from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CheckInDto } from './dto/check-in.dto';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly roomsService: RoomsService,
    private readonly auditService: AuditService,
  ) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  private get selection() {
    return `
      *,
      guests(*),
      rooms(*),
      room_types(*)
    `;
  }

  private validateDates(checkIn: string, checkOut: string) {
    if (checkOut <= checkIn) {
      throw new BadRequestException('checkOut must be after checkIn.');
    }
  }

  private async getReservationRecord(id: string) {
    const { data, error } = await this.client
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  private validateTransition(current: ReservationStatus, next: ReservationStatus) {
    const allowed: Record<ReservationStatus, ReservationStatus[]> = {
      [ReservationStatus.PENDING]: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW],
      [ReservationStatus.CONFIRMED]: [ReservationStatus.CHECKED_IN, ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW],
      [ReservationStatus.CHECKED_IN]: [ReservationStatus.CHECKED_OUT],
      [ReservationStatus.CHECKED_OUT]: [],
      [ReservationStatus.CANCELLED]: [],
      [ReservationStatus.NO_SHOW]: [],
    };

    if (current !== next && !allowed[current].includes(next)) {
      throw new BadRequestException(`Cannot change reservation from ${current} to ${next}.`);
    }
  }

  private async validateRoomAssignment(
    reservationId: string,
    roomId: string,
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
  ) {
    const { data: room, error: roomError } = await this.client
      .from('rooms')
      .select('id, room_type_id, status')
      .eq('id', roomId)
      .single();

    if (roomError) throw roomError;
    if (room.room_type_id !== roomTypeId) {
      throw new BadRequestException('Room does not match the reservation room type.');
    }
    if (!['AVAILABLE', 'CLEAN'].includes(room.status)) {
      throw new BadRequestException('Room is not available for assignment.');
    }

    const available = await this.roomsService.findAvailable({
      checkIn,
      checkOut,
      roomTypeId,
      excludeReservationId: reservationId,
    });
    if (!available.rooms.some((candidate) => candidate.id === roomId)) {
      throw new BadRequestException('Room is blocked by maintenance or an overlapping reservation.');
    }
  }

  async findAll() {
    const { data, error } = await this.client
      .from('reservations')
      .select(this.selection)
      .order('check_in');

    if (error) {
      throw error;
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.client
      .from('reservations')
      .select(this.selection)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async findByStatus(status: ReservationStatus) {
    const { data, error } = await this.client
      .from('reservations')
      .select(this.selection)
      .eq('status', status)
      .order('check_in');

    if (error) {
      throw error;
    }

    return data;
  }

  async create(dto: CreateReservationDto) {
    this.validateDates(dto.checkIn, dto.checkOut);

    const { data, error } = await this.client
      .from('reservations')
      .insert({
        guest_id: dto.guestId,
        room_type_id: dto.roomTypeId,
        room_id: dto.roomId,
        booking_type: dto.bookingType,
        check_in: dto.checkIn,
        check_out: dto.checkOut,
        number_of_guests: dto.numberOfGuests,
        status: dto.status,
        total_amount: dto.totalAmount,
        deposit_amount: dto.depositAmount,
        payment_status: dto.paymentStatus,
        notes: dto.notes,
        special_requests: dto.specialRequests,
      })
      .select(this.selection)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id: string, dto: UpdateReservationDto) {
    const current = await this.getReservationRecord(id);
    const checkIn = dto.checkIn ?? current.check_in;
    const checkOut = dto.checkOut ?? current.check_out;
    const roomTypeId = dto.roomTypeId ?? current.room_type_id;

    this.validateDates(checkIn, checkOut);
    if ([ReservationStatus.CHECKED_OUT, ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW].includes(current.status)) {
      throw new BadRequestException('Completed or cancelled reservations cannot be edited.');
    }
    if (dto.status) {
      this.validateTransition(current.status, dto.status);
    }
    if (dto.roomId) {
      await this.validateRoomAssignment(id, dto.roomId, roomTypeId, checkIn, checkOut);
    }

    const updates = {
      ...(dto.guestId !== undefined && { guest_id: dto.guestId }),
      ...(dto.roomTypeId !== undefined && { room_type_id: dto.roomTypeId }),
      ...(dto.roomId !== undefined && { room_id: dto.roomId }),
      ...(dto.bookingType !== undefined && { booking_type: dto.bookingType }),
      ...(dto.checkIn !== undefined && { check_in: dto.checkIn }),
      ...(dto.checkOut !== undefined && { check_out: dto.checkOut }),
      ...(dto.numberOfGuests !== undefined && {
        number_of_guests: dto.numberOfGuests,
      }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.totalAmount !== undefined && { total_amount: dto.totalAmount }),
      ...(dto.depositAmount !== undefined && {
        deposit_amount: dto.depositAmount,
      }),
      ...(dto.paymentStatus !== undefined && {
        payment_status: dto.paymentStatus,
      }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.specialRequests !== undefined && {
        special_requests: dto.specialRequests,
      }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.client
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select(this.selection)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async availableRooms(id: string) {
    const reservation = await this.getReservationRecord(id);
    return this.roomsService.findAvailable({
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      roomTypeId: reservation.room_type_id,
      excludeReservationId: id,
    });
  }

  async checkIn(id: string, dto: CheckInDto, userId?: string) {
    const { data, error } = await this.client.rpc('check_in_reservation', {
      p_reservation_id: id,
      p_room_id: dto.roomId ?? null,
    });

    if (error) {
      throw error;
    }

    await this.auditService.record({
      userId,
      action: 'CHECK_IN_RESERVATION',
      entityType: 'reservation',
      entityId: id,
      details: { roomId: dto.roomId ?? null },
    });

    return data;
  }

  async checkOut(id: string, userId?: string) {
    const { data, error } = await this.client.rpc('check_out_reservation', {
      p_reservation_id: id,
    });

    if (error) {
      throw error;
    }

    await this.auditService.record({
      userId,
      action: 'CHECK_OUT_RESERVATION',
      entityType: 'reservation',
      entityId: id,
    });

    return data;
  }
}
