export interface IHttpClient {
  post<ResponseType>(
    urlPath: string,
    payload: Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<ResponseType>;
}
