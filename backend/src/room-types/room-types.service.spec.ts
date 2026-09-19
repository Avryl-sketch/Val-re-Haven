import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { RoomTypesService } from './room-types.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('RoomTypesService', () => {
  let service: RoomTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomTypesService,
        { provide: SupabaseService, useValue: { getClient: jest.fn() } },
      ],
    }).compile();

    service = module.get<RoomTypesService>(RoomTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
