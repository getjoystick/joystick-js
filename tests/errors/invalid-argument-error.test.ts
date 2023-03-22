import { InvalidArgumentError } from "../../src/errors/invalid-argument-error";
import { JoystickError } from "../../src/errors/joystick-error";

describe("test InvalidArgumentError", () => {
  it("init", () => {
    const nowStr = Date.now().toString();

    const sut = new InvalidArgumentError(nowStr);

    expect(sut.message).toEqual(nowStr);

    expect(sut).toBeInstanceOf(JoystickError);
  });
});
