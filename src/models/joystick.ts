import { InMemoryCache } from "../cache/in-memory-cache";
import { ApiResponse } from "./api-response";
import { ApiClient } from "../services/api-client";
import { Client } from "../clients/client";

interface JoystickProps {
  userId?: string;
  apiKey?: string;
  semVer?: string;
  params?: Record<string, any>;
  options?: {
    cacheLength?: number;
    serialize?: boolean;
  };
}

interface ContentOptions {
  refresh: boolean;
  serialized: boolean;
  fullResponse: boolean;
}

const DEFAULT_CACHE_LENGTH_IN_MINUTES = 10;

const defaultProps: JoystickProps = {
  options: {
    cacheLength: DEFAULT_CACHE_LENGTH_IN_MINUTES,
  },
};

export class Joystick {
  private _props: JoystickProps = defaultProps;
  private _cache: InMemoryCache<ApiResponse> | undefined;

  private _apiClient: ApiClient | undefined;
  private _fnApiClient: (apiKey: string) => ApiClient;

  constructor(
    fnApiClient: (apiKey: string) => ApiClient = (apiKey) =>
      new ApiClient(new Client(apiKey))
  ) {
    this._fnApiClient = fnApiClient;
  }

  init(props: JoystickProps) {
    this._props = { ...this._props, ...props };

    this.clearCache();
  }

  getApiKey(): string | undefined {
    return this._props.apiKey;
  }

  getUserId(): string | undefined {
    return this._props.userId;
  }

  getCacheLength(): number {
    return this._props.options?.cacheLength || DEFAULT_CACHE_LENGTH_IN_MINUTES;
  }

  clearCache(): void {
    this._cache = new InMemoryCache<ApiResponse>(this.getCacheLength());

    const apiKey = this.getApiKey();

    this._apiClient = apiKey ? this._fnApiClient(apiKey) : undefined;
  }

  async getContent(
    contentId: string,
    options?: ContentOptions
  ): Promise<Record<string, ApiResponse> | undefined> {
    const content = this._cache?.get(contentId);

    if (content) {
      return {
        [contentId]: content,
      };
    }

    const responseType =
      options?.serialized ?? this._props.options?.serialize
        ? "serialized"
        : undefined;

    const freshContent = await this.getApiClient().getContent(
      contentId,
      {
        ...this._props,
      },
      responseType
    );

    if (!freshContent) {
      return;
    }

    this._cache?.set(contentId, freshContent);

    return {
      [contentId]: freshContent,
    };
  }

  async getContents(
    contentIds: string[],
    options?: ContentOptions
  ): Promise<Record<string, ApiResponse> | undefined> {
    return contentIds.reduce((result, contentId) => {
      const content = this._cache?.get(contentId);

      if (!content) {
        return result;
      }

      this._cache?.set(contentId, content);

      return {
        ...result,
        [contentId]: content,
      };
    }, {} as Record<string, ApiResponse>);
  }

  setApiKey(apiKey: string) {
    this._props.apiKey = apiKey;

    this.clearCache();
  }

  private getApiClient(): ApiClient {
    if (!this._apiClient) {
      throw new Error("Please provide an API Key before calling getContent");
    }

    return this._apiClient;
  }
}
