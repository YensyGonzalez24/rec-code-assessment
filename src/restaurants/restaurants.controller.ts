import { Body, Controller, Get } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { SearchRestaurantsDto } from './dto/search-restaurants.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  async getRestaurants(@Body() searchRestaurantsDto: SearchRestaurantsDto) {
    console.log(searchRestaurantsDto);

    return this.restaurantsService.getRestaurants(null, null, null);
  }
}
