import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { SearchRestaurantsDto } from './dto/search-restaurants.dto';
import { ReservationTimeError, UserNotFoundError } from '../common/errors';
import { Restaurant } from '@prisma/client';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  /**
   * Get all restaurants.
   * @returns {Promise<Restaurant[]>} - The list of all restaurants.
   * @throws {HttpException} - If an error occurs while retrieving the restaurants.
   */
  @Get()
  async getAllRestaurants(): Promise<Restaurant[]> {
    try {
      const restaurants =
        await this.restaurantsService.getAllRestaurantsWithTables();

      return restaurants;
    } catch (error) {
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
   * Search for restaurants based on the provided query.
   * @param {SearchRestaurantsDto} searchRestaurantsQuery - The query to search for restaurants.
   * @returns {Promise<Restaurant[] | { message: string, data: [] }>} - The list of filtered restaurants or a message indicating no restaurants found.
   * @throws {HttpException} - If an error occurs while searching for restaurants.
   */
  @Post('search')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async getRestaurants(
    @Body() searchRestaurantsQuery: SearchRestaurantsDto,
  ): Promise<Restaurant[] | { message: string; data: [] }> {
    console.log(searchRestaurantsQuery);

    try {
      const restaurants = await this.restaurantsService.getFilteredRestaurants(
        searchRestaurantsQuery,
      );

      if (restaurants.length === 0) {
        return {
          message: 'No restaurants found',
          data: [],
        };
      }

      return restaurants;
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new HttpException(
          {
            message: error.message,
            code: error.code,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error instanceof ReservationTimeError) {
        throw new HttpException(
          {
            message: error.message,
            code: error.code,
          },
          HttpStatus.BAD_REQUEST,
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
}
