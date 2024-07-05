import { ErrorCodes } from '../utils/constants';
import { CustomError } from './custom-error';

class DietaryRestrictionsError extends CustomError {
  constructor(uncoveredDietaryRestrictions: string[], restaurantName: string) {
    super(
      ErrorCodes.dietaryRestrictions,
      `The following dietary restrictions are not covered by ${restaurantName}: ${uncoveredDietaryRestrictions.join(', ')}`,
    );
  }
}

class ConflictingReservationError extends CustomError {
  constructor(userIdsString: string, message: string) {
    super(
      ErrorCodes.conflictingReservation,
      `The following ${message} a conflicting reservation: ${userIdsString}`,
    );
  }
}

class TableNotFoundError extends CustomError {
  constructor() {
    super(ErrorCodes.tableNotFound, 'Table not found');
  }
}

class TableCapacityError extends CustomError {
  constructor(capacity: number, totalGuests: number) {
    super(
      ErrorCodes.tableCapacity,
      `This table has a maximum capacity of ${capacity} guests and your party is of ${totalGuests}.`,
    );
  }
}

class TableAlreadyReservedError extends CustomError {
  constructor() {
    super(
      ErrorCodes.tableAlreadyReserved,
      'This table is already reserved at this time.',
    );
  }
}

export {
  DietaryRestrictionsError,
  ConflictingReservationError,
  TableNotFoundError,
  TableCapacityError,
  TableAlreadyReservedError,
};
