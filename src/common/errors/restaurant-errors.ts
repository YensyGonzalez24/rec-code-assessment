import { ErrorCodes } from '../utils/constants';
import { CustomError } from './custom-error';

class ReservationTimeError extends CustomError {
  constructor() {
    super(
      ErrorCodes.reservationTime,
      'Reservation time must be in the future.',
    );
  }
}

export { ReservationTimeError };
