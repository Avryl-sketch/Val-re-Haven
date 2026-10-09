import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';

@Injectable()
export class BillingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  private readonly invoiceSelection = '*, reservations(*, guests(*), room_types(*)), invoice_items(*)';

  async findAllInvoices() {
    const { data, error } = await this.client
      .from('invoices')
      .select(this.invoiceSelection)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findInvoice(id: string) {
    const { data, error } = await this.client
      .from('invoices')
      .select(this.invoiceSelection)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async findInvoiceByReservation(reservationId: string) {
    const { data, error } = await this.client
      .from('invoices')
      .select(this.invoiceSelection)
      .eq('reservation_id', reservationId)
      .single();

    if (error) throw error;
    return data;
  }

  async createInvoice(dto: CreateInvoiceDto, actorId: string) {
    const { data, error } = await this.client.rpc('billing_create_invoice', {
      p_reservation_id: dto.reservationId,
      p_currency: dto.currency ?? 'PHP',
      p_tax_amount: 0,
      p_discount_amount: 0,
      p_deposit_applied: 0,
      p_notes: dto.notes ?? null,
      p_actor_id: actorId,
    });

    if (error) throw error;
    return this.findInvoice(data.id);
  }

  async addInvoiceItem(dto: CreateInvoiceItemDto, actorId: string) {
    const { error } = await this.client.rpc('billing_add_invoice_item', {
      p_invoice_id: dto.invoiceId,
      p_description: dto.description,
      p_quantity: dto.quantity,
      p_unit_price: dto.unitPrice,
      p_idempotency_key: dto.idempotencyKey,
      p_actor_id: actorId,
    });

    if (error) throw error;
    return this.findInvoice(dto.invoiceId);
  }

  async finalizeInvoice(id: string, actorId: string) {
    const { data, error } = await this.client.rpc('billing_finalize_invoice', {
      p_invoice_id: id,
      p_actor_id: actorId,
    });

    if (error) throw error;
    return this.findInvoice(data.id);
  }

  async updateDiscount(id: string, discountAmount: number, actorId: string) {
    const { data, error } = await this.client.rpc('billing_update_invoice_discount', {
      p_invoice_id: id,
      p_discount_amount: discountAmount,
      p_actor_id: actorId,
    });
    if (error) throw error;
    return this.findInvoice(data.id);
  }

  async applyPayment(id: string, paymentId: string, actorId: string) {
    const { data, error } = await this.client.rpc('billing_apply_payment_to_invoice', {
      p_payment_id: paymentId,
      p_invoice_id: id,
      p_actor_id: actorId,
    });
    if (error) throw error;
    return data;
  }
}
