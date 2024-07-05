import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EatersService } from '../eaters/eaters.service';
import { SearchRestaurantsDto } from './dto/search-restaurants.dto';
import { ReservationTimeError } from '../common/errors/restaurant-errors';

@Injectable()
export class RestaurantsService {
  constructor(
    private prisma: PrismaService,
    private eatersService: EatersService,
  ) {}

  /**
   * Retrieves filtered restaurants based on search criteria.
   * @param ownerId - The ID of the owner.
   * @param invitees - The list of invitees.
   * @param additionalGuests - The number of additional guests.
   * @param reservationTime - The reservation time.
   * @returns An array of available tables for the given search criteria.
   * @throws ReservationTimeError if the reservation time is in the past.
   */
  async getFilteredRestaurants({
    ownerId,
    invitees,
    additionalGuests,
    reservationTime,
  }: SearchRestaurantsDto) {
    const reservationTimeDate = new Date(reservationTime);

    if (reservationTimeDate < new Date()) {
      throw new ReservationTimeError();
    }

    const { totalGuests, dietaryRestrictions } =
      await this.eatersService.getEatersInfo({
        ownerId,
        invitees,
        additionalGuests,
      });

    console.log('restrictions', dietaryRestrictions);

    const restaurants = await this.getAllRestaurants();

    console.log('restaurants', restaurants);

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
      reservationTimeDate,
    );

    return availableTables.length > 0 ? availableTables : [];
  }

  /**
   * Retrieves all restaurants.
   * @returns An array of all restaurants.
   */
  async getAllRestaurants() {
    return this.prisma.restaurant.findMany();
  }

  /**
   * Retrieves all restaurants with their tables.
   * @returns An array of all restaurants with their tables.
   */
  async getAllRestaurantsWithTables() {
    return this.prisma.restaurant.findMany({
      include: {
        tables: true,
      },
    });
  }

  /**
   * Retrieves tables for a specific restaurant based on capacity.
   * @param restaurantId - The ID of the restaurant.
   * @param capacity - The capacity of the tables.
   * @returns An array of tables for the given restaurant and capacity.
   */
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
          gte: capacity,
        },
      },
      include: {
        reservations: true,
      },
    });
  }

  /**
   * Filters restaurants based on dietary restrictions.
   * @param restaurants - The array of restaurants to filter.
   * @param dietaryRestrictions - The array of dietary restrictions.
   * @returns An array of restaurants that meet the dietary restrictions.
   */
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

  /**
   * Retrieves restaurants with available tables for the given search criteria.
   * @param matchingRestaurants - The array of restaurants that meet the dietary restrictions.
   * @param totalGuests - The total number of guests.
   * @returns An array of restaurants with available tables.
   */
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

  /**
   * Filters tables based on reservation time.
   * @param tableResults - The array of tables to filter.
   * @param reservationTime - The reservation time.
   * @returns An array of tables that are available at the given reservation time.
   */
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
