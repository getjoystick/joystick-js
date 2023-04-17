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
        "https://api.getjoystick.com/api/v1/combine/",
        It.isObject({
          u: "",
          p: {},
        }),
        It.isObject({
          c: '["a123456789012345678901234567"]',
          dynamic: "true",
        })
      )
    ).thenResolve({
      a123456789012345678901234567: {
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

    const sut = new JoystickApiClient(mockClient, logger);

    expect(
      await sut.getDynamicContent(["a123456789012345678901234567"], {
        params: {},
      })
    ).toEqual({
      a123456789012345678901234567: {
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
        "https://api.getjoystick.com/api/v1/combine/",
        It.isObject({
          u: "",
          p: {},
        }),
        It.isObject({
          c: '["a123456789012345678901234567","a223456789012345678901234568"]',
          dynamic: "true",
        })
      )
    ).thenResolve({
      a123456789012345678901234567: "Error 401 - Something went wrong",
      a223456789012345678901234568: {
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

    const sut = new JoystickApiClient(mockClient, logger);

    await expect(() =>
      sut.getDynamicContent(
        ["a123456789012345678901234567", "a223456789012345678901234568"],
        {
          params: {},
        }
      )
    ).rejects.toThrow(
      new MultipleContentsApiError("- Error 401 - Something went wrong")
    );
  });

  it('GCS-12 - responseType:"serialized"', async () => {
    const mockClient = mock<AxiosClient>();

    when(() =>
      mockClient.post(
        "https://api.getjoystick.com/api/v1/combine/",
        It.isObject({
          u: "",
          p: {},
        }),
        It.isObject({
          c: '["a223456789012345678901234568"]',
          dynamic: "true",
          responseType: "serialized",
        })
      )
    ).thenResolve({
      a223456789012345678901234568: {
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

    const sut = new JoystickApiClient(mockClient, logger);

    expect(
      await sut.getDynamicContent(
        ["a223456789012345678901234568"],
        {
          params: {},
        },
        "serialized"
      )
    ).toEqual({
      a223456789012345678901234568: {
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
