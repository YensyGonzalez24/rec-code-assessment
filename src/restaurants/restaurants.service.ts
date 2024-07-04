import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EatersService } from '../eaters/eaters.service';

@Injectable()
export class RestaurantsService {
  constructor(
    private prisma: PrismaService,
    private eatersService: EatersService,
  ) {}

  async getFilteredRestaurants({
    eaterIds,
    additionalGuests,
    reservationTime,
  }: {
    eaterIds: string[];
    additionalGuests: number;
    reservationTime: Date;
  }) {
    if (reservationTime < new Date()) {
      throw new Error('Reservation time must be in the future.');
    }

    const totalGuests = eaterIds.length + additionalGuests;

    const restaurants = await this.getAllRestaurants();
    const eaters = await this.eatersService.getEatersById(eaterIds);
    const dietaryRestrictions = this.getDietaryRestrictions(eaters);

    if (eaters.length !== eaterIds.length) {
      throw new Error('Some users do not exist in the database.');
    }

    const matchingRestaurants = this.filterRestaurantsByDietaryRestrictions(
      restaurants,
      dietaryRestrictions,
    );

    if (matchingRestaurants.length === 0) {
      return [];
    }

    const tableResults = await this.getRestaurantsWithAvailableTables(
      matchingRestaurants,
      totalGuests,
    );

    if (tableResults.length === 0) {
      return [];
    }

    const availableTables = this.filterTablesByReservationTime(
      tableResults,
      reservationTime,
    );

    return availableTables.length > 0 ? availableTables : [];
  }

  async getAllRestaurants() {
    return this.prisma.restaurant.findMany();
  }

  async getTablesForRestaurant({
    restaurantId,
    capacity,
  }: {
    restaurantId: string;
    capacity: number;
  }) {
    return this.prisma.table.findMany({
      where: {
        restaurantId,
        capacity: {
          gt: capacity,
        },
      },
      include: {
        reservations: true,
      },
    });
  }

  private getDietaryRestrictions(eaters: any[]) {
    return eaters.flatMap((eater) => eater.dietaryRestrictions);
  }

  private filterRestaurantsByDietaryRestrictions(
    restaurants: any[],
    dietaryRestrictions: string[],
  ) {
    return restaurants.filter((restaurant) => {
      return dietaryRestrictions.every((restriction) =>
        restaurant.endorsements.includes(restriction),
      );
    });
  }

  private async getRestaurantsWithAvailableTables(
    matchingRestaurants: any[],
    totalGuests: number,
  ) {
    const tablesPromises = matchingRestaurants.map(async (restaurant) => {
      const tables = await this.getTablesForRestaurant({
        restaurantId: restaurant.id,
        capacity: totalGuests,
      });
      if (tables.length === 0) {
        return null;
      }
      return {
        ...restaurant,
        tables,
      };
    });

    return (await Promise.all(tablesPromises)).filter(Boolean);
  }

  private filterTablesByReservationTime(
    tableResults: any[],
    reservationTime: Date,
  ) {
    return tableResults
      .map((restaurant) => {
        const availableTables = restaurant.tables
          .map(({ reservations, ...restOfTable }) => {
            const hasNoConflictingReservations = !reservations.some(
              (reservation) =>
                reservation.startTime.getTime() === reservationTime.getTime(),
            );

            return hasNoConflictingReservations ? restOfTable : null;
          })
          .filter(Boolean);

        if (availableTables.length > 0) {
          return {
            ...restaurant,
            tables: availableTables,
          };
        }
        return null;
      })
      .filter(Boolean);
  }
}
