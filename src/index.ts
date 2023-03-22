import { ContentOptions } from "./models/content-options";
import { ApiResponse } from "./models/api-response";
import { Properties } from "./models/properties";
import { Cache } from "./internals/cache/cache";
import { Logger } from "./internals/logger/logger";
import { AxiosClient } from "./internals/client/axios-client";
import { InMemoryCache } from "./internals/cache/in-memory-cache";
import { SdkLogger } from "./internals/logger/sdk-logger";
import { sha256ToHex } from "./internals/hash/sha256-to-hex";
import { ApiClient } from "./clients/api-client";
import { JoystickApiClient } from "./clients/joystick-api-client";
import { ApiUnkownError } from "./errors/api-unkown-error";
import { MultipleContentsApiError } from "./errors/multiple-contents-api-error";
import { ApiServerError } from "./errors/api-server-error";
import { ApiBadRequestError } from "./errors/api-bad-request-error";

const DEFAULT_CACHE_EXPIRATION_IN_SECONDS = 300;

const SEM_VER_REG_EXP = new RegExp(/^[0-9]+.[0-9]+.[0-9]+$/);

/**
 * Main class
 */
export class Joystick {
  private readonly properties: Properties;
  private readonly apiClient: ApiClient;
  private readonly cache: Cache<Record<string, ApiResponse>>;
  private readonly logger: Logger;

  /**
   * Initialize the class with default values.
   *
   * @param properties
   *  Default values for the class properties.
   *  Only apiKey is required.
   *  Optional parameters to provide a different ApiClient implementation.
   *  Used mostly in testing.
   * @param apiClient
   *  if not specified, the library provides a default implementation, using Axios
   * @param logger
   *  if not specified, the library provides a default implementation based on Console class.
   * @param cache
   *  if not specified, the library provides an in-memory implementation, using Map class.
   */
  constructor({
    properties,
    apiClient,
    logger,
    cache,
  }: {
    properties: Properties;
    apiClient?: ApiClient;
    logger?: Logger;
    cache?: Cache<Record<string, ApiResponse>>;
  }) {
    const { semVer, userId, apiKey } = properties;

    this.validateApiKey(apiKey);
    this.validateUserId(userId);
    this.validateSemVer(semVer);

    this.properties = properties;

    this.logger = logger ?? new SdkLogger();

    this.apiClient =
      apiClient ??
      new JoystickApiClient({
        client: new AxiosClient({
          apiKey: this.getApiKey(),
          logger: this.logger,
        }),
        logger: this.logger,
      });

    this.cache =
      cache ??
      new InMemoryCache<Record<string, ApiResponse>>({
        cacheExpirationInSeconds: this.getCacheExpirationInSeconds(),
        logger: this.logger,
      });
  }

  /**
   * Get the value of parameter key.
   *
   * TValue can be used to specify a concret return type, like a object.
   * @example
   *  const value=getParamValue<{name:string}>("key");
   *
   *  console.log(value?.name);
   *
   * Default use:
   * @example
   *  const value=getParamValue("key");
   *
   *  console.log(value);
   */
  getParamValue<TValue>(key: string): TValue | undefined {
    return this.properties.params?.[key] as TValue;
  }

  setParamValue(key: string, value: unknown): void {
    this.properties.params = {
      ...this.properties.params,
      [key]: value,
    };

    this.clearCache();
  }

  getApiKey(): string {
    return this.properties.apiKey;
  }

  getUserId(): string | undefined {
    return this.properties.userId;
  }

  getSemVer(): string | undefined {
    return this.properties.semVer;
  }

  setSemVer(semVer: string | undefined) {
    this.validateSemVer(semVer);

    this.properties.semVer = semVer;

    this.clearCache();
  }

  getParams(): Record<string, unknown> | undefined {
    return this.properties.params;
  }

  getCacheExpirationInSeconds(): number {
    return (
      this.properties.options?.cacheExpirationInSeconds ||
      DEFAULT_CACHE_EXPIRATION_IN_SECONDS
    );
  }

  /**
   *
   * Calls the clear method from the cache implementation.
   *
   * @Note For shared caches, it is cache's implementor responsability to maintain track of keys to be deleted by the method.
   *
   */
  clearCache(): void {
    this.cache.clear();
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
    this.validateContentIds(contentIds);

    const cacheKey = await this.buildCacheKey(contentIds, options);

    const cachedData = await this.cache.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const freshContent = await this.apiClient.getDynamicContent({
        contentIds,
        payload: this.properties,
        responseType: options?.serialized ? "serialized" : undefined,
      });

      this.cache.set(cacheKey, freshContent);

      return freshContent;
    } catch (e) {
      if (e instanceof ApiUnkownError) {
        this.logger.error(
          "Found an unknown error when getting content from Joystick"
        );
      } else if (e instanceof MultipleContentsApiError) {
        this.logger.error(
          `The following errors found when calling Multiple Content API:\n${e.message}`
        );
      } else if (e instanceof ApiServerError) {
        this.logger.error(
          "Found a server error when getting content from Joystick"
        );
      } else if (e instanceof ApiBadRequestError) {
        this.logger.error(
          "Found a client error when getting content from Joystick"
        );
      }

      throw e;
    }
  }

  private async buildCacheKey(
    contentIds: string[],
    options: ContentOptions | undefined
  ): Promise<string> {
    const parts = [
      this.getApiKey(),
      this.getParamsSortedByKeyAsc(this.getParams()),
      this.getSemVer(),
      this.getUserId(),
      contentIds.sort(),
      options?.serialized ?? this.properties.options?.serialized,
      options?.fullResponse ?? false,
    ];

    return await sha256ToHex(parts);
  }

  private getParamsSortedByKeyAsc(
    params: Record<string, unknown> = {}
  ): Record<string, unknown> {
    return Object.entries(params)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }

  setUserId(userId: string | undefined) {
    this.validateUserId(userId);

    this.properties.userId = userId;

    this.clearCache();
  }

  setCacheExpirationInSeconds(cacheExpirationInSeconds: number) {
    this.validateCacheExpirationInSeconds(cacheExpirationInSeconds);

    this.properties.options = {
      ...this.properties.options,
      cacheExpirationInSeconds,
    };

    this.cache.setCacheExpirationInSeconds(cacheExpirationInSeconds);
  }

  setParams(params: Record<string, unknown> | undefined) {
    this.properties.params = params;

    this.clearCache();
  }

  private validateContentIds(contentIds: string[]) {
    if (
      contentIds.length == 0 ||
      contentIds.some((contentId) => !contentId.trim())
    ) {
      throw new Error(
        "The contentIds parameter must be a non-empty array of strings."
      );
    }
  }

  private validateApiKey(apiKey: string) {
    if (!apiKey.trim()) {
      throw new Error(`Invalid apiKey: ${apiKey}`);
    }
  }

  private validateCacheExpirationInSeconds(
    cacheExpirationInSeconds: number | undefined
  ) {
    if (cacheExpirationInSeconds != undefined && cacheExpirationInSeconds < 0) {
      throw new Error(
        `Invalid cacheExpirationInSeconds: ${cacheExpirationInSeconds}`
      );
    }
  }

  private validateSemVer(semVer: string | undefined) {
    if (semVer && !SEM_VER_REG_EXP.test(semVer)) {
      throw new Error(`Invalid semVer: ${semVer}`);
    }
  }

  private validateUserId(userId: string | undefined) {
    if (userId && !userId.trim()) {
      throw new Error(`Invalid userId: ${userId}`);
    }
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
}
