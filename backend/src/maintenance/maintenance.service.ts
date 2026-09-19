import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  private validateDates(startDate: string, expectedEndDate: string) {
    if (expectedEndDate <= startDate) {
      throw new BadRequestException('expectedEndDate must be after startDate.');
    }
  }

  private readonly selection = '*, rooms(*, room_types(*))';

  async findAll() {
    const { data, error } = await this.client
      .from('maintenance_records')
      .select(this.selection)
      .order('start_date');

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.client
      .from('maintenance_records')
      .select(this.selection)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async findByStatus(status: string) {
    const { data, error } = await this.client
      .from('maintenance_records')
      .select(this.selection)
      .eq('status', status)
      .order('start_date');

    if (error) throw error;
    return data;
  }

  async findByRoom(roomId: string) {
    const { data, error } = await this.client
      .from('maintenance_records')
      .select('*')
      .eq('room_id', roomId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async create(dto: CreateMaintenanceDto) {
    this.validateDates(dto.startDate, dto.expectedEndDate);

    const { data, error } = await this.client
      .from('maintenance_records')
      .insert({
        room_id: dto.roomId,
        reason: dto.reason,
        start_date: dto.startDate,
        expected_end_date: dto.expectedEndDate,
        status: dto.status,
        notes: dto.notes,
      })
      .select(this.selection)
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdateMaintenanceDto) {
    if (dto.startDate && dto.expectedEndDate) {
      this.validateDates(dto.startDate, dto.expectedEndDate);
    }

    const updates = {
      ...(dto.reason !== undefined && { reason: dto.reason }),
      ...(dto.startDate !== undefined && { start_date: dto.startDate }),
      ...(dto.expectedEndDate !== undefined && {
        expected_end_date: dto.expectedEndDate,
      }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.client
      .from('maintenance_records')
      .update(updates)
      .eq('id', id)
      .select(this.selection)
      .single();

    if (error) throw error;
    return data;
  }
}
