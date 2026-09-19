import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { StaffRole } from './roles.enum';

export type AuthenticatedUser = {
  id: string;
  email?: string;
  role?: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    const { data: profile } = await this.supabaseService
      .getClient()
      .from('staff_profiles')
      .select('role, active')
      .eq('id', data.user.id)
      .maybeSingle();

    return {
      id: data.user.id,
      email: data.user.email,
      role: profile?.active
        ? profile.role
        : typeof data.user.app_metadata?.role === 'string'
          ? (data.user.app_metadata.role as StaffRole)
          : undefined,
    };
  }
}
