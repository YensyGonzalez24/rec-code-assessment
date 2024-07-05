import { CustomError } from '../errors/custom-error';
import { ErrorCodes } from '../utils/constants';

class UserNotFoundError extends CustomError {
  constructor(missingUserIds: string[]) {
    super(
      ErrorCodes.userNotFound,
      `The following user ids do not exist: ${missingUserIds.join(', ')}`,
    );
  }
}

export { UserNotFoundError };
