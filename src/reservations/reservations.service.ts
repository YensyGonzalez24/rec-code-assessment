import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async createReservation(data: CreateReservationDto) {
    console.log(data);
    console.log('Creating reservation...');

    return true;
  }

  async getAllReservations() {
    console.log('Getting all reservations ...');

    return true;
  }

  async deleteReservation(id: string) {
    console.log(id);
    console.log('Deleting reservation...');

    return true;
  }
}
