import { ApiResponse } from "../../src/models/api-response";

describe("ApiResponse", () => {
  it("init", () => {
    const sut: ApiResponse = {
      data: "required-data",
      hash: "required-hash",
      meta: {
        mod: 1,
        uid: 2,
        variants: [],
        seg: [],
      },
    };

    expect(sut).toEqual({
      data: "required-data",
      hash: "required-hash",
      meta: {
        mod: 1,
        variants: [],
        seg: [],
        uid: 2,
      },
    });
  });
});
