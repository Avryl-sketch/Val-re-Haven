import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

const ACTIVE_RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN'];

@Injectable()
export class DashboardService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getSummary() {
    const today = new Date().toISOString().slice(0, 10);
    const client = this.supabaseService.getClient();

    const [
      arrivalsResult,
      departuresResult,
      currentGuestsResult,
      roomsResult,
      paymentsResult,
      reservationsResult,
      recentReservationsResult,
    ] = await Promise.all([
      client
        .from('reservations')
        .select('*, guests(*), rooms(*), room_types(*)')
        .eq('check_in', today)
        .in('status', ACTIVE_RESERVATION_STATUSES),
      client
        .from('reservations')
        .select('*, guests(*), rooms(*), room_types(*)')
        .eq('check_out', today)
        .eq('status', 'CHECKED_IN'),
      client
        .from('reservations')
        .select('*, guests(*), rooms(*), room_types(*)')
        .eq('status', 'CHECKED_IN'),
      client.from('rooms').select('id, room_number, floor, status'),
      client
        .from('payments')
        .select('amount, status, paid_at')
        .eq('status', 'SUCCEEDED')
        .gte('paid_at', `${today}T00:00:00.000Z`)
        .lt('paid_at', `${today}T23:59:59.999Z`),
      client
        .from('reservations')
        .select('id, total_amount, status')
        .in('status', ACTIVE_RESERVATION_STATUSES),
      client
        .from('reservations')
        .select('*, guests(*), rooms(*), room_types(*)')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const errors = [
      arrivalsResult,
      departuresResult,
      currentGuestsResult,
      roomsResult,
      paymentsResult,
      reservationsResult,
      recentReservationsResult,
    ].find((result) => result.error);

    if (errors?.error) {
      throw errors.error;
    }

    const rooms = roomsResult.data ?? [];
    const reservations = reservationsResult.data ?? [];
    const payments = paymentsResult.data ?? [];

    const outstandingBalances = reservations.reduce(
      (total, reservation) => total + Number(reservation.total_amount ?? 0),
      0,
    );
    const todayRevenue = payments.reduce(
      (total, payment) => total + Number(payment.amount ?? 0),
      0,
    );

    const roomCounts = rooms.reduce<Record<string, number>>((counts, room) => {
      counts[room.status] = (counts[room.status] ?? 0) + 1;
      return counts;
    }, {});

    return {
      date: today,
      arrivals: arrivalsResult.data ?? [],
      departures: departuresResult.data ?? [],
      currentGuests: currentGuestsResult.data ?? [],
      roomCounts,
      availableRooms: roomCounts.AVAILABLE ?? 0,
      occupiedRooms: roomCounts.OCCUPIED ?? 0,
      reservedRooms: roomCounts.RESERVED ?? 0,
      dirtyRooms: roomCounts.DIRTY ?? 0,
      maintenanceRooms: roomCounts.MAINTENANCE ?? 0,
      todayRevenue,
      outstandingBalances,
      recentReservations: recentReservationsResult.data ?? [],
    };
  }
}
