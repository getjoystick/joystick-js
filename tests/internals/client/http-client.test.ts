import mockAxios from "jest-mock-axios";
import { HttpClient } from "../../../src/internals/client/http-client";

describe("HttpClient", () => {
  afterEach(() => {
    mockAxios.reset();
  });

  it("post", async () => {
    const sut = new HttpClient("api.key");

    const name = "name";

    await sut.post("/ping", { name });

    expect(mockAxios.post).toHaveBeenCalledWith("/ping");
  });
});
