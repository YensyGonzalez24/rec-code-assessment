import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';
import { UserIdDto } from '../../eaters/dto/userId.dto';

class SearchRestaurantsDto {
  @Type(() => UserIdDto)
  owner: UserIdDto;

  @IsArray()
  @Type(() => UserIdDto)
  invitees: UserIdDto[];

  @IsInt()
  additionalGuests: number;

  @IsNotEmpty()
  reservationTime: Date;
}

export { SearchRestaurantsDto };
