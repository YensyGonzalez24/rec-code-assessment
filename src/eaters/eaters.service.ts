import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserNotFoundError } from '../common/errors/eaters-errors';

@Injectable()
export class EatersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves information about eaters based on the provided parameters.
   * @param ownerId - The ID of the owner.
   * @param invitees - An array of IDs representing the invitees.
   * @param additionalGuests - The number of additional guests.
   * @returns An object containing eater IDs, total number of guests, and dietary restrictions.
   * @throws UserNotFoundError if any of the provided user IDs are not found.
   */
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

      throw new UserNotFoundError(missingUserIds);
    }

    const dietaryRestrictions = [
      ...new Set(eaters.flatMap((eater) => eater.dietaryRestrictions)),
    ];

    return { eaterIds, totalGuests, dietaryRestrictions };
  }

  /**
   * Retrieves all eaters.
   * @returns An array of all eaters.
   */
  async getAllEaters() {
    return this.prisma.eater.findMany();
  }

  /**
   * Retrieves eaters based on the provided IDs.
   * @param eaterIds - An array of eater IDs.
   * @returns An array of eaters matching the provided IDs.
   */
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
