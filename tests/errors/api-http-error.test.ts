import { ApiHttpError } from "../../src/errors/api-http-error";
import { JoystickError } from "../../src/errors/joystick-error";

describe("test ApiHttpError", () => {
  it("init", () => {
    const nowStr = Date.now().toString();

    const sut = new ApiHttpError(nowStr);

    expect(sut.message).toEqual(nowStr);

    expect(sut).toBeInstanceOf(JoystickError);
  });
});
