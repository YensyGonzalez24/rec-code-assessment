import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EatersService {
  constructor(private prisma: PrismaService) {}

  async getAllEaters() {
    console.log('Getting all eaters ...');

    return this.prisma.eater.findMany();
  }
}
