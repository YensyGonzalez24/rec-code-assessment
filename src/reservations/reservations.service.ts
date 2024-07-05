import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { EatersService } from '../eaters/eaters.service';
import { Reservation } from '@prisma/client';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private eatersService: EatersService,
  ) {}

  async createNewReservation(data: CreateReservationDto) {
    const { startTime, ownerId, invitees, tableId, additionalGuests, endTime } =
      data;

    const { eaterIds, totalGuests, dietaryRestrictions } =
      await this.eatersService.getEatersInfo({
        ownerId,
        invitees,
        additionalGuests,
      });

    await this.checkEaterAvailability({ startTime, eaterIds });

    const table = await this.checkTableCapacity({ tableId, totalGuests });

    await this.checkTableAvailability({ startTime, table });

    this.checkDietaryRestrictions({ dietaryRestrictions, table });

    const reservation: Omit<Reservation, 'id'> = {
      startTime,
      endTime: endTime || new Date(startTime.getTime() + 2 * 60 * 60 * 1000),
      ownerId,
      additionalGuests,
      tableId,
    };

    const newReservation = this.createReservation(reservation, invitees);

    return newReservation;
  }

  private checkDietaryRestrictions({
    dietaryRestrictions,
    table,
  }: {
    dietaryRestrictions: string[];
    table: any;
  }) {
    const uncoveredDietaryRestrictions = dietaryRestrictions.filter(
      (restriction) => !table.restaurant.endorsements.includes(restriction),
    );

    if (uncoveredDietaryRestrictions.length > 0) {
      throw new Error(
        `The following dietary restrictions are not covered by ${table.restaurant.name}: ${uncoveredDietaryRestrictions.join(', ')}`,
      );
    }
  }

  private async checkEaterAvailability({
    startTime,
    eaterIds,
  }: {
    startTime: Date;
    eaterIds: string[];
  }) {
    const existingReservations = await this.getReservatrionsByTimeAndUserId({
      startTime,
      userIds: eaterIds,
    });

    if (existingReservations.length > 0) {
      const userIds = existingReservations.reduce(
        (acc: string[], reservation) => {
          acc.push(
            reservation.ownerId,
            ...reservation.invitees.map((invitee) => invitee.id),
          );
          return acc;
        },
        [],
      );

      const uniqueUserIds = [...new Set(userIds)].filter((id) =>
        eaterIds.includes(id),
      );

      const userIdsString = uniqueUserIds.join(', ');

      const message = uniqueUserIds.length > 1 ? 'users have' : 'user has';

      throw new Error(
        'The following ' +
          message +
          ' a conflicting reservation: ' +
          userIdsString,
      );
    }
  }

  private async checkTableCapacity({ tableId, totalGuests }) {
    const table = await this.getTableById(tableId);

    if (!table) {
      throw new Error('Table not found');
    }

    if (table.capacity < totalGuests) {
      throw new Error(
        `This table has a maximum capacity of ${table.capacity} guests and your party is of ${totalGuests}.`,
      );
    }

    return table;
  }

  private async checkTableAvailability({
    startTime,
    table,
  }: {
    startTime: Date;
    table: any;
  }) {
    table.reservations.forEach((reservation) => {
      const isStartTimeMatch =
        startTime.getTime() >= reservation.startTime.getTime() &&
        startTime.getTime() <= reservation.endTime.getTime();

      if (isStartTimeMatch) {
        throw new Error('This table is already reserved at this time.');
      }
    });
  }

  //Prisma query and mutation methods

  async getReservatrionsByTimeAndUserId({
    startTime,
    userIds,
  }: {
    startTime: Date;
    userIds: string[];
  }) {
    return this.prisma.reservation.findMany({
      where: {
        AND: [
          {
            startTime: {
              equals: startTime,
            },
          },
          {
            OR: [
              {
                ownerId: {
                  in: userIds,
                },
              },
              {
                invitees: {
                  some: {
                    id: {
                      in: userIds,
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        invitees: true,
      },
    });
  }

  async getAllReservations() {
    return this.prisma.reservation.findMany();
  }

  async getTableById(id: string) {
    return this.prisma.table.findUnique({
      where: {
        id,
      },
      include: {
        restaurant: true,
        reservations: true,
      },
    });
  }

  async deleteReservation(id: string) {
    console.log(id);
    console.log('Deleting reservation...');

    return true;
  }

  async createReservation(
    reservation: Omit<Reservation, 'id'>,
    invitees: string[],
  ) {
    return this.prisma.reservation.create({
      data: {
        ...reservation,
        invitees: {
          connect: invitees.map((id) => ({ id })),
        },
      },
    });
  }
}
