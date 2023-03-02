import { ApiResponse } from "./api-response";
import { ApiClient } from "../services/api-client";
import { ApiCache } from "./api-cache";
import { HttpClient } from "../internals/client/http-client";

interface JoystickProps {
  userId?: string;
  apiKey: string;
  semVer?: string;
  params?: Record<string, any>;
  options?: {
    cacheExpirationInSeconds?: number;
    serialized?: boolean;
  };
}

interface ContentOptions {
  refresh: boolean;
  serialized: boolean;
  fullResponse: boolean;
}

const DEFAULT_CACHE_EXPIRATION_IN_SECONDS = 300;

type ApiClientFn = (apiKey: string) => ApiClient;

/**
 * Main class
 */
export class Joystick {
  private readonly _props: JoystickProps;
  private readonly _apiClient: ApiClient;
  private _cache?: ApiCache;

  constructor(
    initialProps: JoystickProps,
    fnApiClient: ApiClientFn = (apiKey) => new ApiClient(new HttpClient(apiKey))
  ) {
    this._props = initialProps;

    this._apiClient = fnApiClient(this.getApiKey());
  }

  getApiKey(): string {
    return this._props.apiKey;
  }

  getUserId(): string | undefined {
    return this._props.userId;
  }

  getSemVer(): string | undefined {
    return this._props.semVer;
  }

  setSemVer(semVer: string | undefined) {
    this._props.semVer = semVer;

    this.clearCache();
  }

  getParams(): Record<string, any> {
    return this._props.params || {};
  }

  getCacheExpirationInSeconds(): number {
    return (
      this._props.options?.cacheExpirationInSeconds ||
      DEFAULT_CACHE_EXPIRATION_IN_SECONDS
    );
  }

  clearCache(): void {
    this._cache = undefined;
  }

  async getContent(
    contentId: string,
    options?: ContentOptions
  ): Promise<Record<string, ApiResponse | undefined>> {
    return this.getContents([contentId], options);
  }

  async getContents(
    contentIds: string[],
    options?: ContentOptions
  ): Promise<Record<string, ApiResponse | undefined>> {
    const missingContentIdsFromCache = options?.refresh
      ? contentIds
      : contentIds.filter((contentId) => !this.getCache().get(contentId));

    const freshContent = await this._apiClient.getDynamicContent(
      missingContentIdsFromCache,
      this._props
    );

    if (freshContent) {
      Object.entries(freshContent).forEach(([contentId, content]) => {
        this.getCache().set(contentId, content);
      });
    }

    const isSerializedActive =
      options?.serialized ?? this._props.options?.serialized;

    return contentIds.reduce((result, contentId) => {
      const content = this.getCache().get(contentId);

      return {
        ...result,
        [contentId]: this.formatContent(
          content,
          isSerializedActive,
          options?.fullResponse
        ),
      };
    }, {});
  }

  private formatContent(
    content: ApiResponse | undefined,
    isSerializedActive: boolean | undefined,
    fullResponse: boolean | undefined
  ) {
    if (!content) {
      return {};
    }

    const { data, meta, hash } = content;

    const massagedData = isSerializedActive ? data : JSON.parse(data);

    if (!fullResponse) {
      return massagedData;
    }

    return {
      data: massagedData,
      hash,
      meta,
    };
  }

  private getCache(): ApiCache {
    if (!this._cache) {
      this._cache = new ApiCache(this.getCacheExpirationInSeconds());
    }

    return this._cache;
  }
}
