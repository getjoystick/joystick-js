import { ApiUnkownError } from "../../src/errors/api-unkown-error";
import { ApiHttpError } from "../../src/errors/api-http-error";

describe("test ApiUnkownError", () => {
  it("init message", () => {
    const nowStr = Date.now().toString();

    const sut = new ApiUnkownError(nowStr);

    expect(sut.message).toEqual(nowStr);
  });

  it("GCS-09 - parent", () => {
    const sut = new ApiUnkownError("");

    expect(sut).toBeInstanceOf(ApiHttpError);
  });
});
