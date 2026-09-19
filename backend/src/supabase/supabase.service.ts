import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.',
      );
    }

    const normalizedUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');

    this.supabase = createClient(normalizedUrl, serviceRoleKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}