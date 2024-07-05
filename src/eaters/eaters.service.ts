import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EatersService {
  constructor(private prisma: PrismaService) {}

  async getEatersInfo({
    ownerId,
    invitees,
    additionalGuests,
  }: {
    ownerId: string;
    invitees: string[];
    additionalGuests: number;
  }) {
    const eaterIds = [ownerId, ...invitees];
    const eaters = await this.getEatersById(eaterIds);
    const totalGuests = eaters.length + additionalGuests;

    if (eaters.length !== eaterIds.length) {
      const missingUserIds = eaterIds.filter(
        (id) => !eaters.map((eater) => eater.id).includes(id),
      );

      throw new Error(
        'The following user ids do not exist: ' + missingUserIds.join(', '),
      );
    }

    const dietaryRestrictions = [
      ...new Set(eaters.flatMap((eater) => eater.dietaryRestrictions)),
    ];

    return { eaterIds, totalGuests, dietaryRestrictions };
  }

  //Prisma query methods

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
