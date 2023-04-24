import { ApiBadRequestError } from "../../src/errors/api-bad-request-error";
import { ApiHttpError } from "../../src/errors/api-http-error";

describe("test ApiBadRequestError", () => {
  it("init message", () => {
    const nowStr = Date.now().toString();

    const sut = new ApiBadRequestError(nowStr);

    expect(sut.message).toEqual(nowStr);
  });

  it("GCS-09 - parent", () => {
    const sut = new ApiBadRequestError("");

    expect(sut).toBeInstanceOf(ApiHttpError);
  });
});
