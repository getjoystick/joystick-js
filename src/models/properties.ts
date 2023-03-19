export interface Properties {
  userId?: string;
  apiKey: string;
  semVer?: string;
  params?: Record<string, unknown>;
  options?: {
    cacheExpirationInSeconds: number;
    serialized?: boolean;
  };
}
