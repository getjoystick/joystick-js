import { ApiServerError } from "../../src/errors/api-server-error";
import { ApiHttpError } from "../../src/errors/api-http-error";

describe("test ApiServerError", () => {
  it("init message", () => {
    const nowStr = Date.now().toString();

    const sut = new ApiServerError(nowStr);

    expect(sut.message).toEqual(nowStr);
  });

  it("GCS-09 - parent", () => {
    const sut = new ApiServerError();

    expect(sut).toBeInstanceOf(ApiHttpError);
  });
});
