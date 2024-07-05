import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

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

  @IsUUID(4, { message: 'the owner userId must be a valid UUID.' })
  @IsNotEmpty()
  tableId: string;
}
