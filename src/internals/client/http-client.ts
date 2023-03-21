export interface HttpClient {
  post<ResponseType>(
    url: string,
    payload: Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<ResponseType>;

  put<ResponseType>(
    url: string,
    payload: Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<ResponseType>;
}
