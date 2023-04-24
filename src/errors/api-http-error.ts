import { JoystickError } from "./joystick-error";

export class ApiHttpError extends JoystickError {
  /**
   * Parent class to group all the errors happening at API Http request level.
   *
   * @param {string} message Api Http Error details
   */
  constructor(message: string) {
    super(message);
  }
}
