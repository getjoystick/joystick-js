import { ApiResponse, ApiResponseError } from "../models/api-response";
import { GetDynamicContentPayload } from "../models/get-dynamic-content-payload";
import { ApiError } from "../errors/api-error";
import { Logger } from "../internals/logger/logger";
import { HttpClient } from "../internals/client/http-client";
import { ApiClient } from "./api-client";
import { PublishContentUpdatePayload } from "../models/publish-content-update-payload";

export class JoystickApiClient implements ApiClient {
  private readonly client: HttpClient;
  private readonly logger: Logger;

  constructor({ client, logger }: { client: HttpClient; logger: Logger }) {
    this.client = client;
    this.logger = logger;
  }

  async getDynamicContent({
    contentIds,
    payload,
    responseType,
  }: {
    contentIds: string[];
    payload: GetDynamicContentPayload;
    responseType?: "serialized";
  }): Promise<Record<string, ApiResponse>> {
    const { params, semVer, userId = "" } = payload;

    const response: Record<string, ApiResponse | ApiResponseError> =
      await this.client.post(
        "https://api.getjoystick.com/api/v1/combine/",
        {
          u: userId,
          v: semVer,
          p: params,
        },
        {
          c: JSON.stringify(contentIds),
          dynamic: "true",
          responseType,
        }
      );

    return Object.entries(response).reduce((acc, [key, value]) => {
      if (ApiError.isApiResponseError(value)) {
        this.logger.error(value);

        throw new ApiError(value);
      }

      return { ...acc, [key]: value };
    }, {});
  }

  async publishContentUpdate(
    contentId: string,
    payload: PublishContentUpdatePayload
  ): Promise<void> {
    const { description, dynamicContentMap = [], content } = payload;

    this.validateDescription(description);
    this.validateContent(content);
    this.validateDynamicContentMap(dynamicContentMap);

    await this.client.put(
      `https://capi.getjoystick.com/api/v1/config/${contentId}`,
      {
        d: description,
        c: content,
        m: dynamicContentMap,
      }
    );
  }

  private validateDescription(description: string) {
    if (description.length < 1 || description.length > 50) {
      throw new Error(
        `Invalid description: ${description}. It should be between 1 and 50 characters long.`
      );
    }
  }

  private validateContent(content: PublishContentUpdatePayload["content"]) {
    try {
      JSON.stringify(content);
    } catch (e) {
      throw new Error("Invalid content. It should be JSON encodable.");
    }
  }

  private validateDynamicContentMap(
    dynamicContentMap: PublishContentUpdatePayload["dynamicContentMap"]
  ) {
    if (dynamicContentMap) {
      try {
        JSON.stringify(dynamicContentMap);
      } catch (e) {
        throw new Error(
          "Invalid dynamicContentMap. It should be JSON encodable."
        );
      }
    }
  }
}
