import { Controller, Get } from '@nestjs/common';
import { EatersService } from './eaters.service';

@Controller('eaters')
export class EatersController {
  constructor(private readonly eatersService: EatersService) {}

  @Get()
  async getEaters() {
    return this.eatersService.getAllEaters();
  }
}
