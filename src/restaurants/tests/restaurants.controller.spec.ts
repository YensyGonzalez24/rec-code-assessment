import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsService } from '../restaurants.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RestaurantsController } from '../restaurants.controller';
import { EatersService } from '../../eaters/eaters.service';
import { eaters, restaurants, tables } from './mockData';

describe('Restaurant Search', () => {
  let controller: RestaurantsController;
  let restaurantService: RestaurantsService;
  let eatersService: EatersService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [RestaurantsService, PrismaService, EatersService],
    }).compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
    restaurantService = module.get<RestaurantsService>(RestaurantsService);
    eatersService = module.get<EatersService>(EatersService);

    jest
      .spyOn(restaurantService, 'getAllRestaurants')
      .mockImplementation(async () => restaurants);

    jest
      .spyOn(eatersService, 'getEatersById')
      .mockImplementation(async (eaterIds: string[]) =>
        eaters.filter((eater) => eaterIds.includes(eater.id)),
      );

    jest
      .spyOn(restaurantService, 'getTablesForRestaurant')
      .mockImplementation(async ({ restaurantId, capacity }) =>
        tables.filter(
          (table) =>
            table.restaurantId === restaurantId && table.capacity >= capacity,
        ),
      );
  });

  describe('RestaurantsController', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('Restaurant Search by Single User', () => {
    it("should return an empty list if no restaurants meet the user's dietary restrictions", async () => {
      const response = await controller.getRestaurants({
        ownerId: '47e9cad5-0a12-48eb-b31f-5efbae918b41',
        invitees: [],
        additionalGuests: 0,
        reservationTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      });

      expect(response).toEqual([]);
    });

    it('should return an empty list if no tables are available at the given time', async () => {
      const response = await controller.getRestaurants({
        ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
        invitees: [],
        additionalGuests: 0,
        reservationTime: new Date('2026-07-03T19:30:00'),
      });

      expect(response).toEqual([]);
    });

    it("should return restaurants with available tables that meet the user's dietary restrictions and given time", async () => {
      const result = await controller.getRestaurants({
        ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
        invitees: [],
        additionalGuests: 0,
        reservationTime: new Date('2026-07-03T19:30:00'),
      });

      expect(result).toEqual([
        {
          id: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
          name: 'Paleo Heaven',
          endorsements: ['Paleo'],
          tables: [
            {
              id: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
              capacity: 4,
              restaurantId: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
            },
            {
              id: '26f44073-ae5a-4812-be87-f7f1cd83609d',
              capacity: 6,
              restaurantId: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
            },
          ],
        },
      ]);
    });
  });

  describe('Restaurant Search by Multiple Users', () => {
    it("should return an empty list if no restaurants meet all users' dietary restrictions", async () => {
      const response = await controller.getRestaurants({
        ownerId: '47e9cad5-0a12-48eb-b31f-5efbae918b41',
        invitees: ['e7393c5c-19c8-45d5-bf5a-8fc76839d74d'],
        additionalGuests: 0,
        reservationTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      });

      expect(response).toEqual([]);
    });

    it('should return an empty list if no tables are available for the group size', async () => {
      const response = await controller.getRestaurants({
        ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
        invitees: [],
        additionalGuests: 6,
        reservationTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      });

      expect(response).toEqual([]);
    });

    it("should return restaurants with available tables that meet all users' dietary restrictions and given time", async () => {
      const resultSingle = await controller.getRestaurants({
        ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
        invitees: ['7be598bc-995f-47da-9469-336c48ef3511'],
        additionalGuests: 3,
        reservationTime: new Date('2026-07-03T19:30:00'),
      });

      expect(resultSingle).toEqual([
        {
          id: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
          name: 'Paleo Heaven',
          endorsements: ['Paleo'],
          tables: [
            {
              id: '26f44073-ae5a-4812-be87-f7f1cd83609d',
              capacity: 6,
              restaurantId: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
            },
          ],
        },
      ]);

      const resultMultiple = await controller.getRestaurants({
        ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
        invitees: ['7be598bc-995f-47da-9469-336c48ef3511'],
        additionalGuests: 2,
        reservationTime: new Date('2026-07-03T19:30:00'),
      });

      expect(resultMultiple).toEqual([
        {
          id: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
          name: 'Paleo Heaven',
          endorsements: ['Paleo'],
          tables: [
            {
              id: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
              capacity: 4,
              restaurantId: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
            },
            {
              id: '26f44073-ae5a-4812-be87-f7f1cd83609d',
              capacity: 6,
              restaurantId: '646dd477-1ba6-48b5-b938-fe88ecd60c1d',
            },
          ],
        },
      ]);
    });
  });

  describe('Restaurant Search - Negative Cases', () => {
    it('should return an error if one of the users does not exist', async () => {
      await expect(
        controller.getRestaurants({
          ownerId: '47e9cad5-0a12-48eb-b31f-5efbae918b41',
          invitees: ['non-existent-id'],
          additionalGuests: 0,
          reservationTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        }),
      ).rejects.toThrow('The following user ids do not exist: non-existent-id');
    });

    it('should return an error if the given time is invalid (e.g., in the past)', async () => {
      await expect(
        controller.getRestaurants({
          ownerId: '47e9cad5-0a12-48eb-b31f-5efbae918b41',
          invitees: [],
          additionalGuests: 0,
          reservationTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        }),
      ).rejects.toThrow('Reservation time must be in the future.');
    });
  });
});
