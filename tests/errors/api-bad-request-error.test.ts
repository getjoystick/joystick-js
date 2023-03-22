import { ApiBadRequestError } from "../../src/errors/api-bad-request-error";
import { ApiHttpError } from "../../src/errors/api-http-error";

describe("test ApiBadRequestError", () => {
  it("init", () => {
    const nowStr = Date.now().toString();

    const sut = new ApiBadRequestError(nowStr);

    expect(sut.message).toEqual(nowStr);

    expect(sut).toBeInstanceOf(ApiHttpError);
  });
});
