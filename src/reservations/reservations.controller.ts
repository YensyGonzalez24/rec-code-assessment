import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  async getAllReservations() {
    return this.reservationsService.getAllReservations();
  }

  @Post()
  async createReservation(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.createReservation(createReservationDto);
  }

  @Delete(':id')
  async deleteReservation(@Param('id') id: string) {
    return this.reservationsService.deleteReservation(id);
  }
}
