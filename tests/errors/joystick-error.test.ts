import { JoystickError } from "../../src/errors/joystick-error";

describe("test JoystickError", () => {
  it("init", () => {
    const nowStr = Date.now().toString();

    const sut = new JoystickError(nowStr);

    expect(sut.message).toEqual(nowStr);

    expect(sut).toBeInstanceOf(Error);
  });
});
