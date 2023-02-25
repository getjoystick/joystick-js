export interface Meta {
  uid: number;
  mod: number;
  seg: object[];
}

export interface ApiResponse {
  data: Record<string, any> | string;
  hash: string;
  meta: Meta;
}
