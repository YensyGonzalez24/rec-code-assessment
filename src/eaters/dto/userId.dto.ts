import { IsUUID } from 'class-validator';

class UserIdDto {
  @IsUUID(4, { message: 'userId must be a valid UUID.' })
  userId: string;
}

export { UserIdDto };
