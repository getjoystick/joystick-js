import { ApiResponse, ApiResponseError } from "../../src/models/api-response";

describe("ApiResponse", () => {
  it("init", () => {
    const sut: ApiResponse = {
      data: "required-data",
      hash: "required-hash",
      meta: {
        mod: 1,
        uid: 2,
        seg: [],
      },
    };

    expect(sut).toEqual({
      data: "required-data",
      hash: "required-hash",
      meta: {
        mod: 1,
        seg: [],
        uid: 2,
      },
    });
  });
});

describe("ApiResponseError", () => {
  it("init", () => {
    const sut: ApiResponseError = {
      errors: [],
      title: "required-title",
      status: 2,
    };

    expect(sut).toEqual({
      errors: [],
      status: 2,
      title: "required-title",
    });
  });
});
