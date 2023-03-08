export interface Properties {
  userId?: string;
  apiKey: string;
  semVer?: string;
  params?: Record<string, any>;
  options?: {
    cacheExpirationInSeconds: number;
    serialized?: boolean;
  };
}
