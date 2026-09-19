import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { RoomsModule } from '../rooms/rooms.module';
import { AuditModule } from '../audit/audit.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [SupabaseModule, RoomsModule, AuditModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
