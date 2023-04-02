import { InvalidArgumentError } from "../../src/errors/invalid-argument-error";
import { JoystickError } from "../../src/errors/joystick-error";

describe("test InvalidArgumentError", () => {
  it("init message", () => {
    const nowStr = Date.now().toString();

    const sut = new InvalidArgumentError(nowStr);

    expect(sut.message).toEqual(nowStr);
  });

  it("GCS-09 - parent", () => {
    const sut = new InvalidArgumentError();

    expect(sut).toBeInstanceOf(JoystickError);
  });
});
