import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export type CreateAuditLog = {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
};

@Injectable()
export class AuditService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async record(entry: CreateAuditLog) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('audit_logs')
      .insert({
        user_id: entry.userId,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        details: entry.details ?? {},
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async findRecent(limit = 100) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 500));

    if (error) throw error;
    return data;
  }
}
