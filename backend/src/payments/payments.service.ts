import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreatePaymentDto,
  PaymentMethod,
  PaymentRecordStatus,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  private readonly selection = '*, reservations(*, guests(*), room_types(*))';

  async findAll() {
    const { data, error } = await this.client
      .from('payments')
      .select(this.selection)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.client
      .from('payments')
      .select(this.selection)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async findByReservation(reservationId: string) {
    const { data, error } = await this.client
      .from('payments')
      .select('*')
      .eq('reservation_id', reservationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  async create(dto: CreatePaymentDto) {
    const status = dto.status ?? PaymentRecordStatus.PENDING;
    if (
      status === PaymentRecordStatus.SUCCEEDED &&
      ![PaymentMethod.CASH, PaymentMethod.BANK_TRANSFER].includes(dto.method)
    ) {
      throw new BadRequestException(
        'External payments must be confirmed by a payment provider before settlement.',
      );
    }
    const { data, error } = await this.client
      .from('payments')
      .insert({
        reservation_id: dto.reservationId,
        amount: dto.amount,
        currency: dto.currency ?? 'PHP',
        method: dto.method,
        status,
        provider: dto.provider,
        provider_reference: dto.providerReference,
        notes: dto.notes,
        paid_at: status === PaymentRecordStatus.SUCCEEDED ? new Date().toISOString() : null,
      })
      .select(this.selection)
      .single();

    if (error) {
      throw error;
    }

    if (status === PaymentRecordStatus.SUCCEEDED) {
      await this.syncReservationPaymentStatus(dto.reservationId);
    }

    return data;
  }

  private async syncReservationPaymentStatus(reservationId: string) {
    const [{ data: reservation, error: reservationError }, { data: payments, error: paymentsError }] = await Promise.all([
      this.client.from('reservations').select('total_amount').eq('id', reservationId).single(),
      this.client.from('payments').select('amount').eq('reservation_id', reservationId).eq('status', PaymentRecordStatus.SUCCEEDED),
    ]);

    if (reservationError) throw reservationError;
    if (paymentsError) throw paymentsError;

    const paid = (payments ?? []).reduce((total, payment) => total + Number(payment.amount ?? 0), 0);
    const paymentStatus = paid >= Number(reservation.total_amount ?? 0)
      ? 'PAID'
      : 'PARTIALLY_PAID';

    const { error } = await this.client
      .from('reservations')
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
      .eq('id', reservationId);

    if (error) throw error;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const updates = {
      ...(dto.currency !== undefined && { currency: dto.currency }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.provider !== undefined && { provider: dto.provider }),
      ...(dto.providerReference !== undefined && {
        provider_reference: dto.providerReference,
      }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.status === PaymentRecordStatus.SUCCEEDED && {
        paid_at: new Date().toISOString(),
      }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.client
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select(this.selection)
      .single();

    if (error) {
      throw error;
    }

    if (dto.status === PaymentRecordStatus.SUCCEEDED) {
      await this.syncReservationPaymentStatus(data.reservation_id);
    }

    return data;
  }
}
