import { IsArray, IsInt, IsNotEmpty, IsUUID } from 'class-validator';

class SearchRestaurantsDto {
  @IsUUID(4, { message: 'the owner userId must be a valid UUID.' })
  @IsNotEmpty()
  ownerId: string;

  @IsArray()
  @IsUUID(4, {
    each: true,
    message: 'the invitees userId must be a valid UUID.',
  })
  invitees: string[];

  @IsInt()
  additionalGuests: number;

  @IsNotEmpty()
  reservationTime: Date;
}

export { SearchRestaurantsDto };
