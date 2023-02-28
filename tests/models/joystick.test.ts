import { Joystick } from "../../src/models/joystick";
import { anyString, anything, instance, mock, reset, when } from "ts-mockito";
import { ApiClient } from "../../src/services/api-client";

describe("test clearCache", () => {
  let mockApiClient: ApiClient;

  it("init only apiKey required", () => {
    const sut = new Joystick();

    sut.init({
      apiKey: "123",
    });

    expect(sut.getApiKey()).toBe("123");
  });

  it("init", () => {
    const sut = new Joystick();

    sut.init({
      apiKey: "123",
      userId: "456",
    });

    expect(sut.getApiKey()).toBe("123");
  });

  it("getContent throws error when API Key is not defined", async () => {
    const sut = new Joystick();

    await expect(
      async () => await sut.getContent("item.1")
    ).rejects.toThrowError(
      "Please provide an API Key before calling getContent"
    );
  });

  it("getContent", async () => {
    const mockApiClient = mock(ApiClient);

    when(
      mockApiClient.getContent(anyString(), anything(), anything())
    ).thenResolve({
      hash: "hash",
      data: {
        id: "item.1",
      },
      meta: {
        uid: 1,
        mod: 0,
        seg: [],
      },
    });

    const apiClient = instance(mockApiClient);

    const sut = new Joystick((_) => apiClient);

    sut.setApiKey("1213");

    expect(await sut.getContent("item.1")).toEqual({
      "item.1": {
        data: { id: "item.1" },
        hash: "hash",
        meta: { mod: 0, seg: [], uid: 1 },
      },
    });
  });

  it("getContents", async () => {
    mockApiClient = mock(ApiClient);

    when(
      mockApiClient.getContents([anyString()], anything(), anything())
    ).thenReject();
    // ).thenResolve({
    //   key1: {
    //     hash: "hash",
    //     data: {
    //       id: "item.1",
    //     },
    //     meta: {
    //       uid: 1,
    //       mod: 0,
    //       seg: [],
    //     },
    //   },
    // });

    const apiClient = instance(mockApiClient);

    const sut = new Joystick((_) => apiClient);

    sut.setApiKey("1213");

    expect(await sut.getContents(["key1"])).toEqual({
      key1: undefined,
    });
  });

  afterEach(() => {
    if (mockApiClient) {
      reset(mockApiClient);
    }
  });
});
