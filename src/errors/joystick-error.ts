export class JoystickError extends Error {
  /**
   * Parent class to group all the errors happening on Joystick Sdk.
   *
   * @param {string} message Error details
   */
  constructor(message: string) {
    super(message);
  }
}
