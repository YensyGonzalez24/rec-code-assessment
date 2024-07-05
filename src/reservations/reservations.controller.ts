import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import {
  ConflictingReservationError,
  DietaryRestrictionsError,
  ReservationTimeError,
  TableAlreadyReservedError,
  TableCapacityError,
  TableNotFoundError,
  UserNotFoundError,
} from '../common/errors';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * Get all reservations.
   * @returns {Promise<any>} A promise that resolves to an array of reservations.
   */
  @Get()
  async getAllReservations() {
    return this.reservationsService.getAllReservations();
  }

  /**
   * Create a new reservation.
   * @param {CreateReservationDto} createReservationDto - The data for creating a reservation.
   * @returns {Promise<any>} A promise that resolves to the newly created reservation.
   * @throws {HttpException} If there is an error creating the reservation.
   */
  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  async createNewReservation(
    @Body() createReservationDto: CreateReservationDto,
  ) {
    try {
      const newReservation =
        await this.reservationsService.createNewReservation(
          createReservationDto,
        );

      return newReservation;
    } catch (error) {
      if (
        error instanceof DietaryRestrictionsError ||
        error instanceof TableCapacityError ||
        error instanceof ReservationTimeError
      ) {
        throw new HttpException(
          {
            message: error.message,
            code: error.code,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        error instanceof ConflictingReservationError ||
        error instanceof TableAlreadyReservedError
      ) {
        throw new HttpException(
          {
            message: error.message,
            code: error.code,
          },
          HttpStatus.CONFLICT,
        );
      }

      if (
        error instanceof TableNotFoundError ||
        error instanceof UserNotFoundError
      ) {
        throw new HttpException(
          {
            message: error.message,
            code: error.code,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        {
          message: error.message,
          code: error.code,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a reservation by ID.
   * @param {string} id - The ID of the reservation to delete.
   * @returns {Promise<any>} A promise that resolves to the deleted reservation.
   */
  @Delete(':id')
  async deleteReservation(@Param('id') id: string) {
    return this.reservationsService.deleteReservation(id);
  }
}
