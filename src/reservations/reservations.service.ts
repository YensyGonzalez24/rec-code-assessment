import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { EatersService } from '../eaters/eaters.service';
import { Reservation } from '@prisma/client';
import {
  ConflictingReservationError,
  DietaryRestrictionsError,
  TableAlreadyReservedError,
  TableCapacityError,
  TableNotFoundError,
} from '../common/errors';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private eatersService: EatersService,
  ) {}

  /**
   * Creates a new reservation based on the provided data.
   *
   * @param data - The data for creating the reservation.
   * @returns The newly created reservation.
   */
  async createNewReservation(data: CreateReservationDto) {
    const { ownerId, invitees, tableId, additionalGuests } = data;

    const startTime = new Date(data.startTime);
    const endTime = data.endTime ? new Date(data.endTime) : null;

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

  /**
   * Checks if the provided dietary restrictions are covered by the restaurant's endorsements.
   * Throws a DietaryRestrictionsError if any dietary restrictions are not covered.
   *
   * @param dietaryRestrictions - The dietary restrictions to check.
   * @param table - The table object containing the restaurant's endorsements.
   */
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
      throw new DietaryRestrictionsError(
        uncoveredDietaryRestrictions,
        table.restaurant.endorsements,
      );
    }
  }

  /**
   * Checks if any of the provided eaters have conflicting reservations at the given start time.
   * Throws a ConflictingReservationError if any conflicts are found.
   *
   * @param startTime - The start time of the reservation.
   * @param eaterIds - The IDs of the eaters to check.
   */
  private async checkEaterAvailability({
    startTime,
    eaterIds,
  }: {
    startTime: Date;
    eaterIds: string[];
  }) {
    const existingReservations = await this.getReservationsByTimeAndUserId({
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

      throw new ConflictingReservationError(userIdsString, message);
    }
  }

  /**
   * Checks if the table has enough capacity to accommodate the total number of guests.
   * Throws a TableCapacityError if the table capacity is insufficient.
   *
   * @param tableId - The ID of the table to check.
   * @param totalGuests - The total number of guests for the reservation.
   * @returns The table object if it exists and has sufficient capacity.
   * @throws TableNotFoundError if the table does not exist.
   * @throws TableCapacityError if the table capacity is insufficient.
   */
  private async checkTableCapacity({ tableId, totalGuests }) {
    const table = await this.getTableById(tableId);

    if (!table) {
      throw new TableNotFoundError();
    }

    if (table.capacity < totalGuests) {
      throw new TableCapacityError(table.capacity, totalGuests);
    }

    return table;
  }

  /**
   * Checks if the table is already reserved at the given start time.
   * Throws a TableAlreadyReservedError if the table is already reserved.
   *
   * @param startTime - The start time of the reservation.
   * @param table - The table object containing the reservations.
   * @throws TableAlreadyReservedError if the table is already reserved.
   */
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
        throw new TableAlreadyReservedError();
      }
    });
  }

  //Prisma query and mutation methods

  /**
   * Retrieves reservations that match the given start time and user IDs.
   *
   * @param startTime - The start time of the reservations.
   * @param userIds - The IDs of the users to filter the reservations.
   * @returns An array of reservations that match the criteria.
   */
  async getReservationsByTimeAndUserId({
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

  /**
   * Retrieves all reservations.
   *
   * @returns An array of all reservations.
   */
  async getAllReservations() {
    return this.prisma.reservation.findMany({
      include: {
        invitees: true,
        table: true,
        owner: true,
      },
    });
  }

  /**
   * Retrieves a table by its ID.
   *
   * @param id - The ID of the table.
   * @returns The table object if it exists, null otherwise.
   */
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

  /**
   * Deletes a reservation by its ID.
   *
   * @param id - The ID of the reservation to delete.
   * @returns The deleted reservation.
   */
  async deleteReservation(id: string) {
    return this.prisma.reservation.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Creates a new reservation with the provided data.
   *
   * @param reservation - The reservation data.
   * @param invitees - The IDs of the invitees for the reservation.
   * @returns The newly created reservation.
   */
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
