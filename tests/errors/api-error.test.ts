import { JoystickError } from "../../src/errors/joystick-error";
import { ApiError } from "../../src/errors/api-error";

describe("test ApiError", () => {
  it("init", () => {
    const nowStr = Date.now().toString();

    const sut = new ApiError(nowStr);

    expect(sut.message).toEqual(nowStr);

    expect(sut).toBeInstanceOf(JoystickError);
  });
});
