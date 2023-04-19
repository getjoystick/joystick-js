export interface PublishContentUpdatePayload {
  description: string;
  content: Record<string, unknown> | unknown[] | string | boolean | number;
  dynamicContentMap?: Record<string, unknown>[];
}
