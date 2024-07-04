import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EatersService {
  constructor(private prisma: PrismaService) {}

  async getAllEaters() {
    return this.prisma.eater.findMany();
  }

  async getEatersById(eaterIds: string[]) {
    return this.prisma.eater.findMany({
      where: {
        id: {
          in: eaterIds,
        },
      },
    });
  }
}
