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

const DEFAULT_CACHE_EXPIRATION_SECONDS = 300;

const SEM_VER_REG_EXP = /^\d+.\d+.\d+$/;

export class Joystick {
  private readonly properties: Properties;
  private readonly apiClient: ApiClient;
  private readonly cache: SdkCache;
  private readonly logger: Logger;

  public getCache(): SdkCache {
    return this.cache;
  }

  constructor(
    properties: Properties,
    apiClient?: ApiClient,
    logger?: Logger,
    cache?: SdkCache
  ) {
    const { semVer, userId, apiKey, options } = properties;

    this.validateApiKey(apiKey);
    this.validateUserId(userId);
    this.validateSemVer(semVer);
    this.validateCacheExpirationSeconds(options?.cacheExpirationSeconds);

    this.properties = properties;

    this.logger = logger ?? new SdkLogger();

    this.apiClient =
      apiClient ??
      new JoystickApiClient(
        new AxiosClient(this.getApiKey(), this.logger),
        this.logger
      );

    this.cache =
      cache ?? new InMemoryCache(this.getCacheExpirationSeconds(), this.logger);
  }

  getParamValue(key: string): unknown {
    return this.properties.params?.[key];
  }

  setParamValue(key: string, value: unknown): void {
    this.properties.params = {
      ...this.properties.params,
      [key]: value,
    };
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
  }

  getParams(): Record<string, unknown> {
    return this.properties.params || {};
  }

  getCacheExpirationSeconds(): number {
    return (
      this.properties.options?.cacheExpirationSeconds ??
      DEFAULT_CACHE_EXPIRATION_SECONDS
    );
  }

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

  async getContent(
    contentId: string,
    options?: ContentOptions
  ): Promise<ApiResponse | undefined> {
    const result = await this.getContents([contentId], options);

    return result[contentId];
  }

  async getContents(
    contentIds: string[],
    options?: ContentOptions
  ): Promise<Record<string, ApiResponse | undefined>> {
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

  private simplifyResponse(freshContent: Record<string, ApiResponse>) {
    return Object.entries(freshContent).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value["data"],
      }),
      {}
    );
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

  setUserId(userId: string | undefined): void {
    this.validateUserId(userId);

    this.properties.userId = userId;
  }

  setSerialized(serialized: boolean): void {
    this.properties.options = {
      ...this.properties.options,
      serialized,
    };
  }

  async setCacheExpirationSeconds(
    cacheExpirationSeconds: number
  ): Promise<void> {
    this.validateCacheExpirationSeconds(cacheExpirationSeconds);

    this.properties.options = {
      ...this.properties.options,
      cacheExpirationSeconds,
    };

    await this.cache.setCacheExpirationSeconds(cacheExpirationSeconds);
  }

  setParams(params: Record<string, unknown>): void {
    this.properties.params = params;
  }

  private validateContentIds(contentIds: string[]) {
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

  getSerialized(serialized?: boolean): boolean | undefined {
    return serialized ?? this.properties.options?.serialized;
  }
}
