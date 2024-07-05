import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { EatersService } from './eaters.service';

@Controller('eaters')
export class EatersController {
  constructor(private readonly eatersService: EatersService) {}

  /**
   * Retrieves all eaters.
   * @returns An array of eaters if found, or an empty array if no eaters are found.
   * @throws HttpException with status 500 if an error occurs while retrieving eaters.
   */
  @Get()
  async getEaters() {
    try {
      const eaters = await this.eatersService.getAllEaters();

      if (eaters.length === 0) {
        return {
          message: 'No eaters found',
          data: [],
        };
      }

      return eaters;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
          code: error.code,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
