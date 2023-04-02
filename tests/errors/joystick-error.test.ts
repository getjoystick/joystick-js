import { JoystickError } from "../../src/errors/joystick-error";

describe("test JoystickError", () => {
  it("init message", () => {
    const nowStr = Date.now().toString();

    const sut = new JoystickError(nowStr);

    expect(sut.message).toEqual(nowStr);
  });

  it("GCS-09 - parent", () => {
    const sut = new JoystickError();

    expect(sut).toBeInstanceOf(Error);
  });
});
