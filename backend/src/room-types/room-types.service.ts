import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RoomTypesService {
	constructor(private readonly supabaseService: SupabaseService) {}

	async findAll() {
		const { data, error } = await this.supabaseService
			.getClient()
			.from('room_types')
			.select('*')
			.order('name');

		if (error) {
			throw error;
		}

		return data;
	}

	async findOne(id: string) {
		const { data, error } = await this.supabaseService
			.getClient()
			.from('room_types')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			throw error;
		}

		return data;
	}
}
