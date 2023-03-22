import { ApiUnkownError } from "../../src/errors/api-unkown-error";
import { ApiHttpError } from "../../src/errors/api-http-error";

describe("test ApiUnkownError", () => {
  it("init", () => {
    const nowStr = Date.now().toString();

    const sut = new ApiUnkownError(nowStr);

    expect(sut.message).toEqual(nowStr);

    expect(sut).toBeInstanceOf(ApiHttpError);
  });
});
