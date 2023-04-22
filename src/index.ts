import { ContentOptions } from "./models/content-options";
import { ApiResponse } from "./models/api-response";
import { Properties } from "./models/properties";
import { SdkCache } from "./internals/cache/sdk-cache";
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
import { InvalidArgumentError } from "./errors/invalid-argument-error";
import { PublishContentUpdatePayload } from "./models/publish-content-update-payload";
import { Services } from "./models/services";

const DEFAULT_CACHE_EXPIRATION_SECONDS = 300;

const SEM_VER_REG_EXP = /^\d+.\d+.\d+$/;

export class Joystick {
  private readonly properties: Properties;
  private readonly apiClient: ApiClient;
  private readonly cache: SdkCache;
  private readonly logger: Logger;

  /**
   * Initializes the Joystick SDK with default values.
   *
   *
   * @param {Object} properties Default values for the SDK
   *  @param {string} properties.apiKey API Key provided by the Joystick platform
   *  @param {string} [properties.userId] UserId value for API request payload u field
   *  @param {string} [properties.semVer] Version of the content to return
   *  @param {string} [properties.params] Params object to send with the requests
   *  @param {object} [properties.options] Options
   *    @param {number} [properties.options.cacheExpirationSeconds] Number of seconds while the cache is valid
   *    @param {boolean} [properties.options.serialized] The returned data should come in string format (true)
   * @param {object} [services] Provides custom implementations for services
   *  @param {ApiClient} [services.apiClient] Custom implementation for the API client
   *  @param {Logger} [services.logger] Custom implementation for logging
   *  @param {SdkCache} [services.cache] Custom implementation for caching
   *
   * @return An instance of the class
   *
   */
  constructor(properties: Properties, services?: Services) {
    const { semVer, userId, apiKey, options } = properties;

    this.validateApiKey(apiKey);
    this.validateUserId(userId);
    this.validateSemVer(semVer);
    this.validateCacheExpirationSeconds(options?.cacheExpirationSeconds);

    this.properties = properties;

    this.logger = services?.logger ?? new SdkLogger();

    this.apiClient =
      services?.apiClient ??
      new JoystickApiClient(
        new AxiosClient(this.getApiKey(), this.logger),
        this.logger
      );

    this.cache =
      services?.cache ??
      new InMemoryCache(this.getCacheExpirationSeconds(), this.logger);
  }

  getCache(): SdkCache {
    return this.cache;
  }

  getParamValue(key: string): unknown {
    return this.properties.params?.[key];
  }

  setParamValue(key: string, value: unknown): Joystick {
    this.properties.params = {
      ...this.properties.params,
      [key]: value,
    };

    return this;
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

  /**
   * Sets the version of the config to get from Joystick.
   *
   * @param semVer
   *   expected undefined or a string following the semVer convention of three groups of numbers split by dots, excluding all the fancy prefixes
   *
   * @return this, allowing fluent setters
   *
   */
  setSemVer(semVer: string | undefined): Joystick {
    this.validateSemVer(semVer);

    this.properties.semVer = semVer;

    return this;
  }

  /**
   * Returns the params property of the properties object.
   *
   *
   * @return object or empty object if it is null
   *
   */
  getParams(): Record<string, unknown> {
    return this.properties.params ?? {};
  }

  /**
   * Get the number of seconds the cache data is valid.
   *
   * If no initial value was specified, it defaults to 300 seconds
   * Can be set on constructor or using @see setCacheExpirationSeconds
   *
   */
  getCacheExpirationSeconds(): number {
    return (
      this.properties.options?.cacheExpirationSeconds ??
      DEFAULT_CACHE_EXPIRATION_SECONDS
    );
  }

  /**
   * Publish a content update to Joystick.
   *
   *
   * @param {string} contentId Identify the content that is being published
   * @param {PublishContentUpdatePayload} payload Pass the data to be published
   *  @param {string} payload.description Description of the new content
   *  @param {Record<string, unknown> | unknown[] | string | boolean | number} payload.content Content object, or an array, or a string, a boolean, or a number
   *  @param {Record<string, unknown>[]} [payload.dynamicContentMap] Array of objects to use as dynamic content
   *
   */
  async publishContentUpdate(
    contentId: string,
    payload: PublishContentUpdatePayload
  ): Promise<void> {
    this.validateContentId(contentId);

    try {
      return await this.apiClient.publishContentUpdate(contentId, payload);
    } catch (e) {
      if (e instanceof ApiUnkownError) {
        this.logger.error(
          "Found an unknown error when publishing content update to Joystick"
        );
      } else if (e instanceof ApiServerError) {
        this.logger.error(
          "Found a server error when publishing content update to Joystick"
        );
      } else if (e instanceof ApiBadRequestError) {
        this.logger.error(
          "Found a client error when publishing content update to Joystick"
        );
      }

      throw e;
    }
  }

  /**
   *
   * Calls the clear method from the cache implementation.
   *
   * @Note For shared caches, it is cache's implementor responsability to maintain track of keys to be deleted by the method.
   *
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Returns the content of a single content ID from Joystick API.
   *
   *
   * @param {string} contentId Identify the content that is being requested
   * @param {ContentOptions} [options] Pass in an optional contentoptions object
   *  @param {boolean} [options.refresh] The cache should be avoided, and the data must be requested from the API
   *  @param {boolean} [options.serialized] Should return string representation of the data, rather than JSON one
   *  @param {boolean} [options.fullResponse] Should include all the metadata in the response
   *
   * @return {TResult}, a generic type. Defaults to ApiResponse if not provided.
   *
   */
  async getContent<TResult extends string = string>(
    contentId: string,
    options: ContentOptions & { fullResponse?: false; serialized: true }
  ): Promise<TResult>;
  async getContent<TResult extends string = string>(
    contentId: string,
    options: ContentOptions & { fullResponse: true; serialized: true }
  ): Promise<ApiResponse<TResult>>;
  async getContent<TResult = any>(
    contentId: string,
    options: ContentOptions & { fullResponse: true; serialized?: false }
  ): Promise<ApiResponse<TResult>>;
  async getContent<TResult = any>(
    contentId: string,
    options: ContentOptions & { serialized?: false; fullResponse?: false }
  ): Promise<TResult>;
  async getContent<TResult = any>(
    contentId: string,
    options?: ContentOptions,
  ): Promise<TResult>;
  async getContent(contentId: string, options?: ContentOptions) {
    const result = await this.getContents([contentId], options);

    return result[contentId];
  }

  /**
   * Returns the contents from Joystick API DynamicContent.
   *
   *
   * @param {string[]} contentIds Pass in an array of content ids
   * @param {ContentOptions} [options] Pass in an optional contentoptions object
   *  @param {boolean} [options.refresh] The cache should be avoided, and the data must be requested from the API
   *  @param {boolean} [options.serialized] Should return string representation of the data, rather than JSON one
   *  @param {boolean} [options.fullResponse] Should include all the metadata in the response
   *
   * @return {Record<string,TResult>} TResult, a generic type. Defaults to ApiResponse if not provided.
   *
   */
  async getContents<
    TResult extends { [K in TContentIds[number]]: string },
    TContentIds extends readonly string[]
  >(
    contentIds: TContentIds,
    options: ContentOptions & { fullResponse?: false; serialized: true }
  ): Promise<{ [K in TContentIds[number]]: TResult[K] }>;
  async getContents<
    TResult extends { [K in TContentIds[number]]: string },
    TContentIds extends readonly string[]
  >(
    contentIds: TContentIds,
    options: ContentOptions & { fullResponse: true; serialized: true }
  ): Promise<{ [K in TContentIds[number]]: ApiResponse<TResult[K]> }>;
  async getContents<TResult extends Record<string, any>>(
    contentIds: Array<keyof TResult>,
    options: ContentOptions & { fullResponse: true }
  ): Promise<{ [K in keyof TResult]: ApiResponse<TResult[K]> }>;
  async getContents<TResult extends Record<string, any>>(
    contentIds: Array<keyof TResult>,
    options: ContentOptions
  ): Promise<TResult>;
  async getContents<TResult extends Record<string, any>>(
    contentIds: Array<keyof TResult>,
    options?: ContentOptions
  ): Promise<TResult>;
  async getContents<TContentIds extends readonly string[]>(
    contentIds: TContentIds,
    options?: ContentOptions
  ): Promise<Record<string, any>> {
    this.validateContentIds(contentIds);

    const cacheKey = await this.buildCacheKey(contentIds, options);

    let content = options?.refresh ? undefined : await this.cache.get(cacheKey);

    if (!content) {
      try {
        content = await this.apiClient.getDynamicContent(
          contentIds,
          {
            params: this.getParams(),
            semVer: this.getSemVer(),
            userId: this.getUserId(),
          },
          this.getSerialized(options?.serialized) ? "serialized" : undefined
        );

        await this.cache.set(cacheKey, content);
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

    if (options?.fullResponse) {
      return content;
    }

    return this.simplifyResponse(content);
  }

  setUserId(userId: string | undefined): Joystick {
    this.validateUserId(userId);

    this.properties.userId = userId;

    return this;
  }

  setSerialized(serialized: boolean): Joystick {
    this.properties.options = {
      ...this.properties.options,
      serialized,
    };

    return this;
  }

  /**
   * Sets the cache expiration time in seconds locally and updates the cache implementation.
   *
   *
   * @param {number} cacheExpirationSeconds Expects a value>=0, indicating the number of seconds the cache remains active
   *
   * @return this, allowing fluent setters
   *
   */
  setCacheExpirationSeconds(cacheExpirationSeconds: number): Joystick {
    this.validateCacheExpirationSeconds(cacheExpirationSeconds);

    this.properties.options = {
      ...this.properties.options,
      cacheExpirationSeconds,
    };

    this.cache.setCacheExpirationSeconds(cacheExpirationSeconds);

    return this;
  }

  setParams(params: Record<string, unknown>): Joystick {
    this.properties.params = params;

    return this;
  }

  /**
   * Returns the serialized property value.
   *
   *
   * @param {boolean} [serialized] If provided, it will be used. If not, the global serialized will be returned.
   *
   * @return A boolean or undefined
   *
   */
  getSerialized(serialized?: boolean): boolean | undefined {
    return serialized ?? this.properties.options?.serialized;
  }

  private simplifyResponse<T>(freshContent: Record<string, ApiResponse<T>>) {
    return Object.entries(freshContent).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value["data"],
      }),
      {}
    );
  }

  private async buildCacheKey(
    contentIds: readonly string[],
    options: ContentOptions | undefined
  ): Promise<string> {
    const parts = [
      this.getApiKey(),
      this.getParamsSortedByKeyAsc(this.getParams()),
      this.getSemVer(),
      this.getUserId(),
      [...contentIds].sort(),
      this.getSerialized(options?.serialized),
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

  private validateContentIds(contentIds: readonly string[]) {
    if (
      !contentIds ||
      contentIds.length == 0 ||
      contentIds.some((contentId) => !contentId.trim())
    ) {
      throw new InvalidArgumentError(
        "The contentIds parameter must be a non-empty array of strings"
      );
    }
  }

  private validateApiKey(apiKey: string) {
    if (!apiKey || !apiKey.trim()) {
      throw new InvalidArgumentError(`Invalid apiKey: <${apiKey}>`);
    }
  }

  private validateCacheExpirationSeconds(
    cacheExpirationSeconds: number | undefined
  ) {
    if (cacheExpirationSeconds != undefined && cacheExpirationSeconds < 0) {
      throw new InvalidArgumentError(
        `Invalid cacheExpirationSeconds: <${cacheExpirationSeconds}>`
      );
    }
  }

  private validateSemVer(semVer: string | undefined) {
    if (semVer && !SEM_VER_REG_EXP.test(semVer)) {
      throw new InvalidArgumentError(`Invalid semVer: <${semVer}>`);
    }
  }

  private validateUserId(userId: string | undefined) {
    if (userId && !userId.trim()) {
      throw new InvalidArgumentError(`Invalid userId: <${userId}>`);
    }
  }

  private validateContentId(contentId: string) {
    if (!contentId || !contentId.trim()) {
      throw new InvalidArgumentError(`Invalid contentId: <${contentId}>`);
    }
  }
}
