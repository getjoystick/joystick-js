import { JoystickError } from "./joystick-error";

export class ApiError extends JoystickError {
  /**
   * Parent class to group all the errors happening at API request level.
   *
   * @param {string} message Api Error details
   */
  constructor(message: string) {
    super(message);
  }
}
