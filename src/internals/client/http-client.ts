export interface HttpClient {
  post({
    url,
    payload,
    params,
  }: {
    url: string;
    payload: Record<string, unknown>;
    params?: Record<string, unknown>;
  }): Promise<Record<string, unknown>>;

  put({
    url,
    payload,
    params,
  }: {
    url: string;
    payload: Record<string, unknown>;
    params?: Record<string, unknown>;
  }): Promise<void>;
}
