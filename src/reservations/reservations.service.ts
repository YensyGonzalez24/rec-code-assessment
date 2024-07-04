import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { EatersService } from '../eaters/eaters.service';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private eatersService: EatersService,
  ) {}

  async createReservation(data: CreateReservationDto) {
    return data;
  }

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
    });
  }

  async getAllReservations() {
    return this.prisma.reservation.findMany();
  }

  async deleteReservation(id: string) {
    console.log(id);
    console.log('Deleting reservation...');

    return true;
  }
}
