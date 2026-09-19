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

  private readonly invoiceSelection = '*, reservations(*), invoice_items(*)';

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

  async createInvoice(dto: CreateInvoiceDto) {
    const { data, error } = await this.client
      .from('invoices')
      .insert({
        reservation_id: dto.reservationId,
        currency: dto.currency ?? 'PHP',
        tax_amount: dto.taxAmount ?? 0,
        discount_amount: dto.discountAmount ?? 0,
        deposit_applied: dto.depositApplied ?? 0,
        notes: dto.notes,
      })
      .select(this.invoiceSelection)
      .single();

    if (error) throw error;
    return data;
  }

  async addInvoiceItem(dto: CreateInvoiceItemDto) {
    const { data, error } = await this.client
      .from('invoice_items')
      .insert({
        invoice_id: dto.invoiceId,
        description: dto.description,
        quantity: dto.quantity,
        unit_price: dto.unitPrice,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}
