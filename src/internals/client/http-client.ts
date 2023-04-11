export interface HttpClient {
  post(
    url: string,
    payload: Record<string, unknown>,
    queryParams?: Record<string, unknown>
  ): Promise<Record<string, unknown>>;

  put(
    url: string,
    payload: Record<string, unknown>,
    queryParams?: Record<string, unknown>
  ): Promise<void>;
}
