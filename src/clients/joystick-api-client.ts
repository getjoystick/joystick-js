import { ApiResponse } from "../models/api-response";
import { GetDynamicContentPayload } from "../models/get-dynamic-content-payload";
import { Logger } from "../internals/logger/logger";
import { HttpClient } from "../internals/client/http-client";
import { ApiClient } from "./api-client";
import { PublishContentUpdatePayload } from "../models/publish-content-update-payload";
import { MultipleContentsApiError } from "../errors/multiple-contents-api-error";
import { InvalidArgumentError } from "../errors/invalid-argument-error";

export class JoystickApiClient implements ApiClient {
  private readonly client: HttpClient;
  private readonly logger: Logger;

  constructor(client: HttpClient, logger: Logger) {
    this.client = client;
    this.logger = logger;
  }

  async getDynamicContent(
    contentIds: string[],
    payload: GetDynamicContentPayload,
    responseType?: "serialized"
  ): Promise<Record<string, ApiResponse>> {
    const { params, semVer, userId = "" } = payload;

    const response = await this.client.post(
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

    this.checkForErrors(response);

    return Object.entries(response).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {}
    );
  }

  async publishContentUpdate(
    contentId: string,
    payload: PublishContentUpdatePayload
  ): Promise<void> {
    const { description, content, dynamicContentMap = [] } = payload;

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
    if (!description || description.length < 1 || description.length > 50) {
      throw new InvalidArgumentError(
        `Invalid description: ${description}. It should be between 1 and 50 characters long`
      );
    }
  }

  private validateContent(content: PublishContentUpdatePayload["content"]) {
    try {
      JSON.stringify(content);
    } catch {
      throw new InvalidArgumentError(
        "Invalid content. It should be JSON encodable"
      );
    }
  }

  private validateDynamicContentMap(
    dynamicContentMap: PublishContentUpdatePayload["dynamicContentMap"]
  ) {
    if (dynamicContentMap) {
      try {
        JSON.stringify(dynamicContentMap);
      } catch {
        throw new InvalidArgumentError(
          "Invalid dynamicContentMap. It should be JSON encodable"
        );
      }
    }
  }

  private checkForErrors(response: Record<string, unknown>) {
    const errorEntries = Object.values(response)
      .filter((value) => typeof value === "string")
      .map((error) => `- ${error as string}`);

    if (errorEntries.length > 0) {
      throw new MultipleContentsApiError(errorEntries.join("\n"));
    }
  }
}
