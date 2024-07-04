import { Test, TestingModule } from '@nestjs/testing';
import { EatersService } from '../eaters.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EatersController } from '../eaters.controller';

describe('EatersController', () => {
  let controller: EatersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EatersController],
      providers: [EatersService, PrismaService],
    }).compile();

    controller = module.get<EatersController>(EatersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all eaters', async () => {
    const eaters = await controller.getEaters();
    expect(eaters).toBeInstanceOf(Array);
  });
});
