import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from '../reservations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ReservationsController } from '../reservations.controller';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [ReservationsService, PrismaService],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
