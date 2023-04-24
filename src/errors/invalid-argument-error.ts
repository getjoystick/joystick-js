import { JoystickError } from "./joystick-error";

export class InvalidArgumentError extends JoystickError {
  /**
   * Thrown whenever an invalid argument is provided.
   *
   * @param {string} message Invalid Argument Error details
   */
  constructor(message: string) {
    super(message);
  }
}
