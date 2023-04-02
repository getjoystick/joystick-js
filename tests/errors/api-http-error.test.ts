import { ApiHttpError } from "../../src/errors/api-http-error";
import { JoystickError } from "../../src/errors/joystick-error";

describe("test ApiHttpError", () => {
  it("init message", () => {
    const nowStr = Date.now().toString();

    const sut = new ApiHttpError(nowStr);

    expect(sut.message).toEqual(nowStr);
  });

  it("GCS-09 - parent", () => {
    const sut = new ApiHttpError();

    expect(sut).toBeInstanceOf(JoystickError);
  });
});
