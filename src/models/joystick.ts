import { ApiResponse } from "./api-response";
import { ApiClient } from "../services/api-client";
import { ApiCache } from "./api-cache";

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

type ApiClientFn = (apiKey: string) => ApiClient;

type InitProps = {
  [Property in keyof JoystickProps]: JoystickProps[Property];
};

/**
 *
 */
export class Joystick {
  private _props: JoystickProps = defaultProps;
  private _cache?: ApiCache;

  private _apiClient?: ApiClient;
  
  private readonly _fnApiClient: ApiClientFn;

  constructor(fnApiClient: ApiClientFn = (apiKey) => new ApiClient(apiKey)) {
    this._fnApiClient = fnApiClient;
  }

  init(props: InitProps) {
    this._props = { ...this._props, ...props };

    this.clearCache();
  }

  getParams(): Record<string, any> {
    return this._props.params || {};
  }

  setParams(params: Record<string, any>) {
    this._props.params = params;

    this.clearCache();
  }

  setParamValue(key: string, value: any) {
    this.getParams()[key] = value;

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
    this._cache = undefined;
  }

  async getContent(
    contentId: string,
    options?: ContentOptions
  ): Promise<Record<string, ApiResponse> | undefined> {
    const content = this.getCache().get(contentId);

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

    this.getCache().set(contentId, freshContent);

    return {
      [contentId]: freshContent,
    };
  }

  async getContents(
    contentIds: string[],
    options?: ContentOptions
  ): Promise<Record<string, ApiResponse> | undefined> {
    return contentIds.reduce((result, contentId) => {
      const content = this.getCache().get(contentId);

      if (!content) {
        return result;
      }

      this.getCache().set(contentId, content);

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

  private getCache(): ApiCache {
    if (!this._cache) {
      this._cache = new ApiCache(this.getCacheLength());
    }

    return this._cache;
  }

  private getApiClient(): ApiClient {
    if (!this._apiClient) {
      const apiKey = this.getApiKey();

      if (!apiKey) {
        throw new Error("Please provide an API Key before calling getContent.");
      }

      this._apiClient = this._fnApiClient(apiKey);
    }

    return this._apiClient;
  }
}
