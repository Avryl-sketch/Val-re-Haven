import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { RoomsService } from './rooms.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('RoomsService', () => {
  let service: RoomsService;
  let getClient: ReturnType<typeof jest.fn>;

  function queryChain(result: unknown) {
    const chain = {
      select: jest.fn(),
      in: jest.fn(),
      lt: jest.fn(),
      gt: jest.fn(),
      not: jest.fn(),
      eq: jest.fn(),
      order: jest.fn(),
      then: (resolve: (value: unknown) => unknown) => resolve(result),
    };

    for (const method of ['select', 'in', 'lt', 'gt', 'not', 'eq', 'order']) {
      chain[method as keyof typeof chain] = jest
        .fn()
        .mockReturnValue(chain) as never;
    }

    return chain;
  }

  beforeEach(async () => {
    getClient = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: SupabaseService,
          useValue: { getClient },
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects availability searches when checkout is not after checkin', async () => {
    await expect(
      service.findAvailable({ checkIn: '2026-10-10', checkOut: '2026-10-10' }),
    ).rejects.toThrow('checkOut must be after checkIn.');
    expect(getClient).not.toHaveBeenCalled();
  });

  it('filters rooms blocked by maintenance and active reservations', async () => {
    const maintenanceQuery = queryChain({
      data: [{ room_id: 'maintenance-room' }],
      error: null,
    });
    const reservationQuery = queryChain({
      data: [{ room_id: 'reserved-room' }],
      error: null,
    });
    const roomQuery = queryChain({
      data: [{ id: 'available-room' }],
      error: null,
    });

    getClient
      .mockReturnValueOnce({ from: jest.fn().mockReturnValue(maintenanceQuery) })
      .mockReturnValueOnce({ from: jest.fn().mockReturnValue(reservationQuery) })
      .mockReturnValueOnce({ from: jest.fn().mockReturnValue(roomQuery) });

    const result = await service.findAvailable({
      checkIn: '2026-10-10',
      checkOut: '2026-10-12',
    });

    expect(roomQuery.not).toHaveBeenCalledWith(
      'id',
      'in',
      '(maintenance-room,reserved-room)',
    );
    expect(result).toMatchObject({
      rooms: [{ id: 'available-room' }],
      maintenanceConflictsChecked: true,
      reservationConflictsChecked: true,
    });
  });
});
