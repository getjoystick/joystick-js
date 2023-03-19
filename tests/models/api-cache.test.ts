import { ApiCache } from "../../src/models/api-cache";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("ApiCache", () => {
  it("init", async () => {
    const sut = new ApiCache(2);

    const expectedValue = {
      hash: "121",
      data: "value1",
      meta: {
        mod: 1,
        uid: 1,
        seg: [],
      },
    };

    expect(sut.get("key1")).toBeUndefined();

    sut.set("key1", expectedValue);

    await delay(1_000);

    expect(sut.get("key1")).toStrictEqual(expectedValue);

    await delay(1_200);

    expect(sut.get("key1")).toBeUndefined();
  });
});
