import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from '../reservations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ReservationsController } from '../reservations.controller';
import { eaters, reservations } from './mockData';
import { EatersService } from '../../eaters/eaters.service';

describe('ReservationsController', () => {
  let controller: ReservationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [ReservationsService, PrismaService, EatersService],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

describe('Reservation Management', () => {
  let reservationController: ReservationsController;
  let reservationService: ReservationsService;
  let eaterService: EatersService;

  const createdReservations = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [ReservationsService, PrismaService, EatersService],
    }).compile();

    reservationController = module.get<ReservationsController>(
      ReservationsController,
    );

    reservationService = module.get<ReservationsService>(ReservationsService);

    eaterService = module.get<EatersService>(EatersService);

    createdReservations.length = 0;

    jest
      .spyOn(reservationService, 'createReservation')
      .mockImplementation(async (reservation) => {
        createdReservations.push(reservation);
        return reservation;
      });

    jest
      .spyOn(reservationService, 'getAllReservations')
      .mockImplementation(async () => reservations);

    jest
      .spyOn(reservationService, 'getReservatrionsByTimeAndUserId')
      .mockImplementation(
        async ({
          startTime,
          userIds,
        }: {
          startTime: Date;
          userIds: string[];
        }) => {
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
      .spyOn(eaterService, 'getEatersById')
      .mockImplementation(async (eaterIds: string[]) =>
        eaters.filter((eater) => eaterIds.includes(eater.id)),
      );
  });

  describe('Reservation Listing', () => {
    it('should get all reservations', async () => {
      const allReservations = await reservationController.getAllReservations();
      expect(allReservations).toEqual(reservations);
    });
  });

  describe('Reservation by Single User', () => {
    it('should throw an error if the user has a conflicting reservation', async () => {
      await expect(
        reservationController.createReservation({
          startTime: new Date('2026-07-03T20:30:00'),
          ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
          invitees: [],
          additionalGuests: 0,
          tableId: 'e34ed028-29b6-4208-9c16-d5c9d6d4c96f',
        }),
      ).rejects.toThrow('Confliting reversation');
    });

    it('should throw an error if the user has dietary restrictions that the restaurant does not meet', async () => {
      await expect(
        reservationController.createReservation({
          startTime: new Date('2026-07-03T20:30:00'),
          ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
          invitees: [],
          additionalGuests: 0,
          tableId: '7d9697a0-de0d-49c5-94e8-08b1270bfb39',
        }),
      ).rejects.toThrow('Dietary restrictions');
    });

    it('should throw an error if the restaurant no longer has that time spot available for that table', async () => {
      await expect(
        reservationController.createReservation({
          startTime: new Date('2026-08-03T20:30:00'),
          ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
          invitees: [],
          additionalGuests: 0,
          tableId: 'e34ed028-29b6-4208-9c16-d5c9d6d4c96f',
        }),
      ).rejects.toThrow('Table is not available');
    });

    it('should successfully create a reservation for a single user with dietary restrictions at a given time', async () => {
      const reservation = await reservationController.createReservation({
        startTime: new Date('2026-07-03T20:30:00'),
        ownerId: 'e7393c5c-19c8-45d5-bf5a-8fc76839d74d',
        invitees: [],
        additionalGuests: 0,
        tableId: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
      });

      expect(reservation).toEqual(createdReservations[0]);
    });
  });

  describe('Reservation by Multiple Users', () => {
    it('should throw an error if any user has a conflicting reservation as a reservation owner', async () => {
      await expect(
        reservationController.createReservation({
          startTime: new Date('2026-08-03T20:30:00'),
          ownerId: '47e9cad5-0a12-48eb-b31f-5efbae918b41',
          invitees: ['7be598bc-995f-47da-9469-336c48ef3511'],
          additionalGuests: 0,
          tableId: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
        }),
      ).rejects.toThrow('Confliting reversation');
    });

    it('should throw an error if any user has a conflicting reservation as a reservation invitee', async () => {
      await expect(
        reservationController.createReservation({
          startTime: new Date('2026-09-03T20:30:00'),
          ownerId: '7be598bc-995f-47da-9469-336c48ef3511',
          invitees: ['47e9cad5-0a12-48eb-b31f-5efbae918b41'],
          additionalGuests: 0,
          tableId: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
        }),
      ).rejects.toThrow('Confliting reversation');
    });

    it('should throw an error if any user has dietary restrictions that the restaurant does not meet', async () => {
      await expect(
        reservationController.createReservation({
          startTime: new Date('2026-07-03T20:30:00'),
          ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
          invitees: ['e7393c5c-19c8-45d5-bf5a-8fc76839d74d'],
          additionalGuests: 0,
          tableId: '26f44073-ae5a-4812-be87-f7f1cd83609d',
        }),
      ).rejects.toThrow('Dietary restrictions');
    });

    it('should throw an error if the selected table cannot seat the party size', async () => {
      await expect(
        reservationController.createReservation({
          startTime: new Date('2026-07-03T20:30:00'),
          ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
          invitees: ['e7393c5c-19c8-45d5-bf5a-8fc76839d74d'],
          additionalGuests: 6,
          tableId: 'a3f45e7c-4b5h-449b-956e-2af496b62d25',
        }),
      ).rejects.toThrow('Table cannot seat party size');
    });

    it('should successfully create a reservation for multiple users with dietary restrictions at a given time', async () => {
      const reservation = await reservationController.createReservation({
        startTime: new Date('2026-07-03T20:30:00'),
        ownerId: '83348328-1043-41b6-96e8-884ad6407e00',
        invitees: ['7be598bc-995f-47da-9469-336c48ef3511'],
        additionalGuests: 0,
        tableId: '26f44073-ae5a-4812-be87-f7f1cd83609d',
      });

      expect(reservation).toEqual(createdReservations[0]);
    });
  });
});
