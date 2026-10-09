import { jest } from '@jest/globals';
import { validate } from 'class-validator';
import { PaymentsService } from './payments.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePaymentDto, PaymentMethod, PaymentRecordStatus } from './dto/create-payment.dto';

describe('PaymentsService', () => {
  const payment = { id: 'payment-id', reservation_id: 'reservation-id' };
  let rpc: ReturnType<typeof jest.fn>;
  let client: { rpc: ReturnType<typeof jest.fn>; from: ReturnType<typeof jest.fn> };
  let service: PaymentsService;

  beforeEach(() => {
    rpc = jest.fn();
    client = {
      rpc,
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({ single: jest.fn(async () => ({ data: payment, error: null })) })),
        })),
      })),
    };
    service = new PaymentsService({ getClient: () => client } as unknown as SupabaseService);
  });

  it('records a cash settlement through the idempotent reconciliation RPC', async () => {
    rpc.mockResolvedValue({ data: payment, error: null });

    await expect(service.create({
      reservationId: 'reservation-id',
      amount: 250,
      method: PaymentMethod.CASH,
      status: PaymentRecordStatus.SUCCEEDED,
      idempotencyKey: 'payment-key',
    }, 'staff-id')).resolves.toEqual(payment);

    expect(rpc).toHaveBeenCalledWith('billing_record_payment', expect.objectContaining({
      p_reservation_id: 'reservation-id',
      p_amount: 250,
      p_status: PaymentRecordStatus.SUCCEEDED,
      p_idempotency_key: 'payment-key',
      p_actor_id: 'staff-id',
    }));
  });

  it('delegates payment reversals to the database reconciliation and audit function', async () => {
    rpc.mockResolvedValue({ data: payment, error: null });

    await service.update('payment-id', { status: PaymentRecordStatus.REFUNDED }, 'staff-id');
    expect(rpc).toHaveBeenCalledWith('billing_update_payment', expect.objectContaining({
      p_payment_id: 'payment-id',
      p_status: PaymentRecordStatus.REFUNDED,
      p_actor_id: 'staff-id',
    }));
  });

  it('rejects external payment methods from the staff payment creation DTO', async () => {
    const dto = Object.assign(new CreatePaymentDto(), {
      reservationId: '00000000-0000-4000-8000-000000000001',
      amount: 250,
      method: PaymentMethod.GCASH,
      status: PaymentRecordStatus.SUCCEEDED,
      idempotencyKey: '00000000-0000-4000-8000-000000000002',
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('method');
  });
});
