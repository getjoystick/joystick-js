import { Joystick } from "../../src/models/joystick";
import { ApiClient } from "../../src/services/api-client";
import { It, mock, reset, when } from "strong-mock";

describe("test clearCache", () => {
  let mockApiClient: ApiClient;

  it("only apiKey required", () => {
    const sut = new Joystick({
      apiKey: "123",
    });

    expect(sut.getApiKey()).toBe("123");
  });

  it("init", () => {
    const sut = new Joystick({
      apiKey: "123",
      userId: "456",
    });

    expect(sut.getApiKey()).toBe("123");
  });

  it("getContent", async () => {
    mockApiClient = mock<ApiClient>();

    when(() =>
      mockApiClient.getDynamicContent(It.isAny(), It.isAny(), It.isAny())
    ).thenResolve({
      key1: {
        hash: "hash",
        data: {
          id: "item.1",
        },
        meta: {
          uid: 1,
          mod: 0,
          seg: [],
        },
      },
      key2: {
        hash: "hash2",
        data: {
          id: "item.21",
        },
        meta: {
          uid: 1,
          mod: 0,
          seg: [],
        },
      },
    });

    const sut = new Joystick(
      {
        apiKey: "123",
      },
      (_) => mockApiClient
    );

    expect(await sut.getContent("key1")).toEqual({
      key1: {
        data: {
          id: "item.1",
        },
        hash: "hash",
        meta: {
          mod: 0,
          seg: [],
          uid: 1,
        },
      },
    });
  });

  afterEach(() => {
    if (mockApiClient) {
      reset(mockApiClient);
    }
  });
});
