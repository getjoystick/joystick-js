import { Services } from "../../src/models/services";
import { mock } from "strong-mock";
import { SdkCache } from "../../src/internals/cache/sdk-cache";
import { Logger } from "../../src/internals/logger/logger";
import { ApiClient } from "../../src/clients/api-client";

describe("test Services", () => {
  it("init", () => {
    let sut: Services = {};

    expect(sut.cache).toBeUndefined();
    expect(sut.logger).toBeUndefined();
    expect(sut.apiClient).toBeUndefined();

    const cache = mock<SdkCache>();

    sut = { cache };

    expect(sut.cache).toBe(cache);
    expect(sut.logger).toBeUndefined();
    expect(sut.apiClient).toBeUndefined();

    const logger = mock<Logger>();

    sut = { logger };

    expect(sut.cache).toBeUndefined();
    expect(sut.logger).toBe(logger);
    expect(sut.apiClient).toBeUndefined();

    const apiClient = mock<ApiClient>();

    sut = { apiClient };

    expect(sut.cache).toBeUndefined();
    expect(sut.logger).toBeUndefined();
    expect(sut.apiClient).toBe(apiClient);

    sut = { cache, logger, apiClient };

    expect(sut.cache).toBe(cache);
    expect(sut.logger).toBe(logger);
    expect(sut.apiClient).toBe(apiClient);
  });
});
