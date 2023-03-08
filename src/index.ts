import { HttpClient } from "./internals/client/http-client";
import { ApiCache } from "./models/api-cache";
import { ApiClient } from "./clients/api-client";
import { ContentOptions } from "./models/content-options";
import { ApiResponse } from "./models/api-response";
import { Properties } from "./models/properties";
import { ILogger } from "./internals/logger/ILogger";

const DEFAULT_CACHE_EXPIRATION_IN_SECONDS = 300;

const semVerRegExp = new RegExp(/^[0-9]+.[0-9]+.[0-9]+$/);

type ApiClientFn = (apiKey: string) => ApiClient;
type LoggerFn = () => ILogger;

function validateProperties({
  semVer,
  cacheExpirationInSeconds,
}: {
  semVer?: string;
  cacheExpirationInSeconds?: number;
}): void {
  if (semVer && !semVerRegExp.test(semVer)) {
    throw new Error(`Invalid semVer: ${semVer}`);
  }

  if (cacheExpirationInSeconds != undefined && cacheExpirationInSeconds < 10) {
    throw new Error(
      `Invalid cacheExpirationInSeconds: ${cacheExpirationInSeconds}`
    );
  }
}

/**
 * Main class
 */
export class Joystick {
  private readonly _properties: Properties;
  private readonly _apiClient: ApiClient;
  private _cache?: ApiCache;

  constructor(
    properties: Properties,
    fnApiClient: ApiClientFn = (apiKey) =>
      new ApiClient(new HttpClient(apiKey, fnLogger())),
    fnLogger: LoggerFn = () => console
  ) {
    const { semVer, options: { cacheExpirationInSeconds } = {} } = properties;

    validateProperties({ semVer, cacheExpirationInSeconds });

    this._properties = properties;

    this._apiClient = fnApiClient(this.getApiKey());
  }

  getApiKey(): string {
    return this._properties.apiKey;
  }

  getUserId(): string | undefined {
    return this._properties.userId;
  }

  getSemVer(): string | undefined {
    return this._properties.semVer;
  }

  setSemVer(semVer: string | undefined) {
    validateProperties({ semVer });

    this._properties.semVer = semVer;

    this.clearCache();
  }

  getParams(): Record<string, any> {
    return this._properties.params || {};
  }

  getCacheExpirationInSeconds(): number {
    return (
      this._properties.options?.cacheExpirationInSeconds ||
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
      this._properties
    );

    if (freshContent) {
      Object.entries(freshContent).forEach(([contentId, content]) => {
        this.getCache().set(contentId, content);
      });
    }

    const isSerializedActive =
      options?.serialized ?? this._properties.options?.serialized;

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

  setUserId(userId: string | undefined) {
    this._properties.userId = userId;

    this.clearCache();
  }

  setCacheExpirationInSeconds(value: number) {
    validateProperties({ cacheExpirationInSeconds: value });

    this._properties.options = {
      ...this._properties.options,
      cacheExpirationInSeconds: value,
    };

    this.clearCache();
  }

  setParams(value: Record<string, any> | undefined) {
    this._properties.params = value;

    this.clearCache();
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

    const massagedData = isSerializedActive || !data ? data : JSON.parse(data);

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
