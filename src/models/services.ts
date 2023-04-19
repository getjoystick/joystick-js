import { ApiClient } from "../clients/api-client";
import { Logger } from "../internals/logger/logger";
import { SdkCache } from "../internals/cache/sdk-cache";

export interface Services {
  apiClient?: ApiClient;
  logger?: Logger;
  cache?: SdkCache;
}
