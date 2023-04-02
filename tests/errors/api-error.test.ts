import { JoystickError } from "../../src/errors/joystick-error";
import { ApiError } from "../../src/errors/api-error";

describe("test ApiError", () => {
  it("init message", () => {
    const nowStr = Date.now().toString();

    const sut = new ApiError(nowStr);

    expect(sut.message).toEqual(nowStr);
  });

  it("GCS-09 - parent", () => {
    const sut = new ApiError();

    expect(sut).toBeInstanceOf(JoystickError);
  });
});
