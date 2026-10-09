import { jest } from '@jest/globals';
import { BillingService } from './billing.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('BillingService', () => {
  const invoice = { id: 'invoice-id', reservation_id: 'reservation-id' };
  const item = { id: 'item-id', invoice_id: 'invoice-id' };
  let rpc: ReturnType<typeof jest.fn>;
  let client: { rpc: ReturnType<typeof jest.fn>; from: ReturnType<typeof jest.fn> };
  let service: BillingService;

  beforeEach(() => {
    rpc = jest.fn();
    client = {
      rpc,
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({ single: jest.fn(async () => ({ data: invoice, error: null })) })),
        })),
      })),
    };
    service = new BillingService({ getClient: () => client } as unknown as SupabaseService);
  });

  it('creates one invoice through the audited transactional RPC', async () => {
    rpc.mockResolvedValue({ data: invoice, error: null });

    await expect(service.createInvoice({ reservationId: 'reservation-id' }, 'staff-id')).resolves.toEqual(invoice);
    expect(rpc).toHaveBeenCalledWith('billing_create_invoice', expect.objectContaining({
      p_reservation_id: 'reservation-id',
      p_deposit_applied: 0,
      p_actor_id: 'staff-id',
    }));
  });

  it('adds a charge using a client idempotency key and reloads server totals', async () => {
    rpc.mockResolvedValue({ data: item, error: null });

    await expect(service.addInvoiceItem({
      invoiceId: 'invoice-id',
      description: 'Room accommodation',
      quantity: 2,
      unitPrice: 3500,
      idempotencyKey: 'charge-key',
    }, 'staff-id')).resolves.toEqual(invoice);
    expect(rpc).toHaveBeenCalledWith('billing_add_invoice_item', expect.objectContaining({
      p_invoice_id: 'invoice-id',
      p_idempotency_key: 'charge-key',
      p_actor_id: 'staff-id',
    }));
  });

  it('finalizes a folio using the server-side finalization function', async () => {
    rpc.mockResolvedValue({ data: invoice, error: null });

    await service.finalizeInvoice('invoice-id', 'staff-id');
    expect(rpc).toHaveBeenCalledWith('billing_finalize_invoice', {
      p_invoice_id: 'invoice-id',
      p_actor_id: 'staff-id',
    });
  });
});
