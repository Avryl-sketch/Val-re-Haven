import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreatePaymentDto,
  PaymentRecordStatus,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  private readonly selection = '*, reservations(*, guests(*), room_types(*)), invoices(*)';

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

  async create(dto: CreatePaymentDto, actorId: string) {
    if (!dto.idempotencyKey) {
      throw new BadRequestException('Payment idempotency key is required.');
    }
    const { data, error } = await this.client.rpc('billing_record_payment', {
      p_reservation_id: dto.reservationId,
      p_invoice_id: dto.invoiceId ?? null,
      p_amount: dto.amount,
      p_currency: dto.currency ?? 'PHP',
      p_method: dto.method,
      p_status: dto.status ?? PaymentRecordStatus.PENDING,
      p_provider: dto.provider ?? null,
      p_provider_reference: dto.providerReference ?? null,
      p_notes: dto.notes ?? null,
      p_idempotency_key: dto.idempotencyKey,
      p_actor_id: actorId,
    });

    if (error) {
      throw error;
    }
    return this.findOne(data.id);
  }

  async update(id: string, dto: UpdatePaymentDto, actorId: string) {
    const { data, error } = await this.client.rpc('billing_update_payment', {
      p_payment_id: id,
      p_status: dto.status ?? null,
      p_currency: dto.currency ?? null,
      p_provider: dto.provider ?? null,
      p_provider_reference: dto.providerReference ?? null,
      p_notes: dto.notes ?? null,
      p_actor_id: actorId,
    });

    if (error) {
      throw error;
    }
    return this.findOne(data.id);
  }
}
