import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { RoomTypesController } from './room-types.controller';
import { RoomTypesService } from './room-types.service';

describe('RoomTypesController', () => {
  let controller: RoomTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomTypesController],
      providers: [{ provide: RoomTypesService, useValue: { findAll: jest.fn(), findOne: jest.fn() } }],
    }).compile();

    controller = module.get<RoomTypesController>(RoomTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
