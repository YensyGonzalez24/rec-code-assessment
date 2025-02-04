import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from '../reservations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ReservationsController } from '../reservations.controller';
import { eaters, reservations, restaurants, tables } from './mockData';
import { EatersService } from '../../eaters/eaters.service';
import { Reservation } from '@prisma/client';
import { HttpException } from '@nestjs/common';
import { ErrorCodes } from '../../common/utils/constants';

describe('Reservation Management', () => {
  let reservationController: ReservationsController;
  let reservationService: ReservationsService;
  let eaterService: EatersService;

  const createdReservations = [];

  const {
    conflictingReservation,
    dietaryRestrictions,
    tableCapacity,
    tableAlreadyReserved,
  } = ErrorCodes;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [ReservationsService, PrismaService, EatersService],
    }).compile();

    reservationController = module.get<ReservationsController>(
      ReservationsController,
    );

    reservationService = module.get<ReservationsService>(ReservationsService);

    eaterService = module.get<EatersService>(EatersService);

    jest
      .spyOn(reservationService, 'createReservation')
      .mockImplementation(
        async (reservation: Omit<Reservation, 'id'>, invitees: string[]) => {
          const inviteList = eaters.filter((eater) => {
            return invitees.includes(eater.id);
          });

          const newReservation = {
            id: '1', // This should be a unique ID, but for the sake of testing, we can use '1
            ...reservation,
            invitees: inviteList,
          };

          createdReservations.push(newReservation);

          return newReservation;
        },
      );

    jest
      .spyOn(reservationService, 'getAllReservations')
      .mockImplementation(async () => {
        return reservations.map((reservation) => {
          const table = tables.find((t) => t.id === reservation.tableId);
          const owner = eaters.find((e) => e.id === reservation.ownerId);

          if (!table || !owner) {
            throw new Error('Table or Owner not found');
          }

          return {
            ...reservation,
            table: {
              id: table.id,
              capacity: table.capacity,
              restaurantId: table.restaurantId,
            },
            owner: {
              id: owner.id,
              name: owner.name,
              dietaryRestrictions: owner.dietaryRestrictions,
            },
          };
        });
      });

    jest
      .spyOn(reservationService, 'getReservationsByTimeAndUserId')
      .mockImplementation(
        async ({
          startTime,
          userIds,
        }: {
          startTime: Date;
          userIds: string[];
        }): Promise<
          ({
            invitees: {
              id: string;
              name: string;
              dietaryRestrictions: string[];
            }[];
          } & {
            id: string;
            startTime: Date;
            endTime: Date;
            ownerId: string;
            additionalGuests: number;
            tableId: string;
          })[]
        > => {
          return reservations.filter((reservation) => {
            const isStartTimeMatch =
              startTime.getTime() >= reservation.startTime.getTime() &&
              startTime.getTime() <= reservation.endTime.getTime();

            const isOwnerMatch = userIds.includes(reservation.ownerId);

            const isInviteeMatch = reservation.invitees.some((invitee) =>
              userIds.includes(invitee.id),
            );

            return isStartTimeMatch && (isOwnerMatch || isInviteeMatch);
          });
        },
      );

    jest
      .spyOn(reservationService, 'getTableById')
      .mockImplementation(async (tableId: string) => {
        const table = tables.find((table) => table.id === tableId);

        if (!table) {
          throw new Error('Table not found');
        }

        const restaurant = restaurants.find(
          (restaurant) => restaurant.id === table.restaurantId,
        );

        const reservationsForTable = reservations.filter(
          (reservation) => reservation.tableId === tableId,
        );

        return { ...table, restaurant, reservations: reservationsForTable };
      });

    jest
      .spyOn(eaterService, 'getEatersById')
      .mockImplementation(async (eaterIds: string[]) =>
        eaters.filter((eater) => eaterIds.includes(eater.id)),
      );
  });

  beforeEach(() => {
    createdReservations.splice(0, createdReservations.length);
  });

  describe('ReservationsController', () => {
    it('should be defined', () => {
      expect(reservationController).toBeDefined();
    });
  });

  describe('Reservation Listing', () => {
    it('should get all reservations', async () => {
      const allReservations = await reservationController.getAllReservations();

      const expectedReservations = reservations.map((reservation) => {
        const table = tables.find((t) => t.id === reservation.tableId);
        const owner = eaters.find((e) => e.id === reservation.ownerId);

        return {
          ...reservation,
          table: {
            id: table.id,
            capacity: table.capacity,
            restaurantId: table.restaurantId,
          },
          owner: {
            id: owner.id,
            name: owner.name,
            dietaryRestrictions: owner.dietaryRestrictions,
          },
        };
      });

      expect(allReservations).toEqual(expectedReservations);
    });
  });

  describe('Reservation by Single User', () => {
    it('should throw an error if the user has a conflicting reservation', async () => {
      try {
        await reservationController.createNewReservation({
          startTime: new Date('2026-07-03T20:30:00').toISOString(),
          ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
          invitees: [],
          additionalGuests: 0,
          tableId: 'e34ed028-29b6-4208-9c16-d5c9d6d4c96f',
        });

        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const response = error.getResponse();
        expect(response.code).toMatch(conflictingReservation);
      }
    });

    it('should throw an error if any user has a conflicting reservation as a reservation invitee', async () => {
      try {
        await reservationController.createNewReservation({
          startTime: new Date('2026-09-03T20:30:00').toISOString(),
          ownerId: '7be598bc-995f-47da-9469-336c48ef3511',
          invitees: [],
          additionalGuests: 0,
          tableId: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
        });

        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const response = error.getResponse();
        expect(response.code).toMatch(conflictingReservation);
      }
    });

    it('should throw an error if the user has dietary restrictions that the restaurant does not meet', async () => {
      try {
        await reservationController.createNewReservation({
          startTime: new Date('2026-10-03T20:30:00').toISOString(),
          ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
          invitees: [],
          additionalGuests: 0,
          tableId: '7d9697a0-de0d-49c5-94e8-08b1270bfb39',
        });

        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const response = error.getResponse();
        expect(response.code).toMatch(dietaryRestrictions);
      }
    });

    it('should throw an error if the restaurant no longer has that time spot available for that table', async () => {
      try {
        await reservationController.createNewReservation({
          startTime: new Date('2026-12-03T20:30:00').toISOString(),
          ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
          invitees: [],
          additionalGuests: 0,
          tableId: 'ed9750c9-9271-4611-a6f4-18885d250ef3',
        });

        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const response = error.getResponse();
        expect(response.code).toMatch(tableAlreadyReserved);
      }
    });

    it('should successfully create a reservation for a single user with dietary restrictions at a given time', async () => {
      const reservation = await reservationController.createNewReservation({
        startTime: new Date('2027-10-03T20:30:00').toISOString(),
        ownerId: '7be598bc-995f-47da-9469-336c48ef3511',
        invitees: [],
        additionalGuests: 0,
        tableId: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
      });

      expect(reservation).toEqual({
        id: '1',
        startTime: new Date('2027-10-03T20:30:00'),
        endTime: new Date('2027-10-03T22:30:00'),
        ownerId: '7be598bc-995f-47da-9469-336c48ef3511',
        additionalGuests: 0,
        tableId: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
        invitees: [],
      });
    });
  });

  describe('Reservation by Multiple Users', () => {
    it('should throw an error if any user has a conflicting reservation as a reservation owner', async () => {
      try {
        await reservationController.createNewReservation({
          startTime: new Date('2026-08-03T20:30:00').toISOString(),
          ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
          invitees: ['7be598bc-995f-47da-9469-336c48ef3511'],
          additionalGuests: 0,
          tableId: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
        });

        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const response = error.getResponse();
        expect(response.code).toMatch(conflictingReservation);
      }
    });

    it('should throw an error if the selected table cannot seat the party size', async () => {
      try {
        await reservationController.createNewReservation({
          startTime: new Date('2026-10-03T20:30:00').toISOString(),
          ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
          invitees: ['e7393c5c-19c8-45d5-bf5a-8fc76839d74d'],
          additionalGuests: 6,
          tableId: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
        });

        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const response = error.getResponse();
        expect(response.code).toMatch(tableCapacity);
      }
    });

    it('should throw an error if any user has dietary restrictions that the restaurant does not meet', async () => {
      try {
        await reservationController.createNewReservation({
          startTime: new Date('2026-10-03T20:30:00').toISOString(),
          ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
          invitees: [
            'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
            '47e9cad5-0a12-48eb-b31f-5efbae918b41',
          ],
          additionalGuests: 0,
          tableId: '26f44073-ae5a-4812-be87-f7f1cd83609d',
        });

        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const response = error.getResponse();
        expect(response.code).toMatch(dietaryRestrictions);
      }
    });

    it('should successfully create a reservation for multiple users with dietary restrictions at a given time', async () => {
      const reservation = await reservationController.createNewReservation({
        startTime: new Date('2026-07-03T20:30:00').toISOString(),
        ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
        invitees: ['7be598bc-995f-47da-9469-336c48ef3511'],
        additionalGuests: 0,
        tableId: '26f44073-ae5a-4812-be87-f7f1cd83609d',
      });

      expect(reservation).toEqual({
        id: '1',
        startTime: new Date('2026-07-03T20:30:00'),
        endTime: new Date('2026-07-03T22:30:00'),
        ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
        additionalGuests: 0,
        tableId: '26f44073-ae5a-4812-be87-f7f1cd83609d',
        invitees: [
          {
            id: '7be598bc-995f-47da-9469-336c48ef3511',
            name: 'Drake',
            dietaryRestrictions: ['Paleo'],
          },
        ],
      });
    });
  });
});
