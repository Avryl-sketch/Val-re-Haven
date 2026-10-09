import { jest } from '@jest/globals';
import { ReservationsService } from './reservations.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RoomsService } from '../rooms/rooms.service';
import { AuditService } from '../audit/audit.service';

describe('ReservationsService billing checkout integration', () => {
  it('delegates atomic folio checkout and actor audit to the database function', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: { id: 'reservation-id' }, error: null });
    const auditRecord = jest.fn();
    const service = new ReservationsService(
      { getClient: () => ({ rpc }) } as unknown as SupabaseService,
      {} as RoomsService,
      { record: auditRecord } as unknown as AuditService,
    );

    await expect(service.checkOut('reservation-id', 'staff-id')).resolves.toEqual({ id: 'reservation-id' });
    expect(rpc).toHaveBeenCalledWith('check_out_reservation', {
      p_reservation_id: 'reservation-id',
      p_actor_id: 'staff-id',
    });
    expect(auditRecord).not.toHaveBeenCalled();
  });
});
