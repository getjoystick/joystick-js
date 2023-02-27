import { InMemoryCache } from "../internals/cache/in-memory-cache";
import { ApiResponse } from "./api-response";

export class ApiCache extends InMemoryCache<ApiResponse> {}
