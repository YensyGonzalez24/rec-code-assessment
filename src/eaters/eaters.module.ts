import { Module } from '@nestjs/common';
import { EatersService } from './eaters.service';
import { EatersController } from './eaters.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EatersService],
  controllers: [EatersController],
  exports: [EatersService],
})
export class EatersModule {}
