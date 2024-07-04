import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async getRestaurants(
    dietaryRestrictions: string[],
    groupSize: number,
    time: Date,
  ) {
    console.log(dietaryRestrictions);
    console.log(groupSize);
    console.log(time);
    console.log('Getting restaurants...');

    return true;
  }
}
