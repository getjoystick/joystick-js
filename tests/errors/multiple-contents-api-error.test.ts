import { MultipleContentsApiError } from "../../src/errors/multiple-contents-api-error";
import { ApiError } from "../../src/errors/api-error";

describe("test MultipleContentsApiError", () => {
  it("init message", () => {
    const nowStr = Date.now().toString();

    const sut = new MultipleContentsApiError(nowStr);

    expect(sut.message).toEqual(nowStr);
  });

  it("GCS-09 - parent", () => {
    const sut = new MultipleContentsApiError("");

    expect(sut).toBeInstanceOf(ApiError);
  });
});
