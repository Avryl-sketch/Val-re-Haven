import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { HousekeepingStatus } from './dto/housekeeping-status.enum';
import { UpdateHousekeepingStatusDto } from './dto/update-housekeeping-status.dto';

@Injectable()
export class HousekeepingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  private readonly roomSelection = '*, room_types(*)';

  async findRooms() {
    const { data, error } = await this.client
      .from('rooms')
      .select(this.roomSelection)
      .in('status', Object.values(HousekeepingStatus))
      .order('floor')
      .order('room_number');

    if (error) throw error;
    return data;
  }

  async findRoomsByStatus(status: HousekeepingStatus) {
    const { data, error } = await this.client
      .from('rooms')
      .select(this.roomSelection)
      .eq('status', status)
      .order('floor')
      .order('room_number');

    if (error) throw error;
    return data;
  }

  async findHistory(roomId: string) {
    const { data, error } = await this.client
      .from('housekeeping_updates')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateStatus(roomId: string, dto: UpdateHousekeepingStatusDto) {
    const { data, error } = await this.client.rpc('update_housekeeping_status', {
      p_room_id: roomId,
      p_status: dto.status,
      p_notes: dto.notes ?? null,
      p_updated_by: dto.updatedBy ?? null,
    });

    if (error) throw error;
    return data;
  }
}
