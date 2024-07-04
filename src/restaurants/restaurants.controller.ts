import { Body, Controller, Get } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { SearchRestaurantsDto } from './dto/search-restaurants.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  async getRestaurants(@Body() searchRestaurantsDto: SearchRestaurantsDto) {
    return this.restaurantsService.getFilteredRestaurants({
      eaterIds: [
        searchRestaurantsDto.ownerId,
        ...searchRestaurantsDto.invitees,
      ],
      additionalGuests: searchRestaurantsDto.additionalGuests,
      reservationTime: searchRestaurantsDto.reservationTime,
    });
  }
}
