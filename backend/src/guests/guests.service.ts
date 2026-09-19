import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

@Injectable()
export class GuestsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  async findAll() {
    const { data, error } = await this.client
      .from('guests')
      .select('*')
      .order('last_name')
      .order('first_name');

    if (error) {
      throw error;
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.client
      .from('guests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async findByEmail(email: string) {
    const { data, error } = await this.client
      .from('guests')
      .select('*')
      .ilike('email', email)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async create(dto: CreateGuestDto) {
    const { data, error } = await this.client
      .from('guests')
      .insert({
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        identification_reference: dto.identificationReference,
        notes: dto.notes,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id: string, dto: UpdateGuestDto) {
    const updates = {
      ...(dto.firstName !== undefined && { first_name: dto.firstName }),
      ...(dto.lastName !== undefined && { last_name: dto.lastName }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.identificationReference !== undefined && {
        identification_reference: dto.identificationReference,
      }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.client
      .from('guests')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
