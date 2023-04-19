export interface HttpClient {
  /**
   * Http Post method abstraction
   *
   * @param url
   * @param payload
   * @param queryParams params to pass to the Url after the ?
   *
   * @returns Json structure as key value structure
   *
   */
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
