import { AxiosClient } from "../../src/internals/client/axios-client";
import { JoystickApiClient } from "../../src/clients/joystick-api-client";
import { SdkLogger } from "../../src/internals/logger/sdk-logger";
import { It, mock, reset, when } from "strong-mock";
import { MultipleContentsApiError } from "../../src/errors/multiple-contents-api-error";

describe("test JoystickApiClient", () => {
  let mockClient: AxiosClient;

  afterEach(() => {
    if (mockClient) {
      reset(mockClient);
    }
  });

  it("GCS-03 - getDynamicContent", async () => {
    mockClient = mock<AxiosClient>();

    when(() =>
      mockClient.post(
        It.isObject({
          url: "https://api.getjoystick.com/api/v1/combine/",
          payload: {
            u: "",
            p: {},
          },
          params: {
            c: '["123456789012345678901234567"]',
            dynamic: "true",
          },
        })
      )
    ).thenResolve({
      123456789012345678901234567: {
        data: {
          content: {
            id: "1234567890",
          },
        },
        hash: "harsh",
        meta: {
          mod: 2,
          seg: [{}],
          uid: 1,
        },
      },
    });

    const logger = new SdkLogger();

    const sut = new JoystickApiClient({
      client: mockClient,
      logger,
    });

    expect(
      await sut.getDynamicContent({
        contentIds: ["123456789012345678901234567"],
        payload: {
          params: {},
        },
      })
    ).toEqual({
      123456789012345678901234567: {
        data: {
          content: {
            id: "1234567890",
          },
        },
        hash: "harsh",
        meta: {
          mod: 2,
          seg: [{}],
          uid: 1,
        },
      },
    });
  });

  it("GCS-11 - MultipleContentsApiError", async () => {
    const mockClient = mock<AxiosClient>();

    when(() =>
      mockClient.post(
        It.isObject({
          url: "https://api.getjoystick.com/api/v1/combine/",
          payload: {
            u: "",
            p: {},
          },
          params: {
            c: '["123456789012345678901234567","223456789012345678901234568"]',
            dynamic: "true",
          },
        })
      )
    ).thenResolve({
      123456789012345678901234567: "Error 401 - Something went wrong",
      223456789012345678901234568: {
        data: {
          content: {
            id: "1234567890",
          },
        },
        hash: "harsh",
        meta: {
          mod: 2,
          seg: [{}],
          uid: 1,
        },
      },
    });

    const logger = new SdkLogger();

    const sut = new JoystickApiClient({
      client: mockClient,
      logger,
    });

    await expect(() =>
      sut.getDynamicContent({
        contentIds: [
          "123456789012345678901234567",
          "223456789012345678901234568",
        ],
        payload: {
          params: {},
        },
      })
    ).rejects.toThrow(
      new MultipleContentsApiError("- Error 401 - Something went wrong")
    );
  });

  it('GCS-12 - responseType:"serialized"', async () => {
    const mockClient = mock<AxiosClient>();

    when(() =>
      mockClient.post(
        It.isObject({
          url: "https://api.getjoystick.com/api/v1/combine/",
          payload: {
            u: "",
            p: {},
          },
          params: {
            c: '["223456789012345678901234568"]',
            dynamic: "true",
            responseType: "serialized",
          },
        })
      )
    ).thenResolve({
      223456789012345678901234568: {
        data: JSON.stringify({
          content: {
            id: "1234567890",
          },
        }),
        hash: "harsh",
        meta: {
          mod: 2,
          seg: [{}],
          uid: 1,
        },
      },
    });

    const logger = new SdkLogger();

    const sut = new JoystickApiClient({
      client: mockClient,
      logger,
    });

    expect(
      await sut.getDynamicContent({
        contentIds: ["223456789012345678901234568"],
        payload: {
          params: {},
        },
        responseType: "serialized",
      })
    ).toEqual({
      223456789012345678901234568: {
        data: '{"content":{"id":"1234567890"}}',
        hash: "harsh",
        meta: {
          mod: 2,
          seg: [{}],
          uid: 1,
        },
      },
    });
  });
});
