import { Type } from 'class-transformer';
import { IsDate, IsString, IsArray, IsInt, IsNotEmpty } from 'class-validator';
import { UserIdDto } from '../../eaters/dto/userId.dto';

export class CreateReservationDto {
  @IsDate()
  @IsNotEmpty()
  startTime: Date;

  @IsDate()
  endTime: Date;

  @Type(() => UserIdDto)
  @IsNotEmpty()
  ownerId: UserIdDto;

  @IsArray()
  @Type(() => UserIdDto)
  invitees: UserIdDto[];

  @IsInt()
  additionalGuests: number;

  @IsString()
  @IsNotEmpty()
  tableId: string;
}
