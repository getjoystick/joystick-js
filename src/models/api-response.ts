export interface Meta {
  uid: number;
  mod: number;
  variants: object[];
  seg: object[];
}

export interface ApiResponse {
  data: string | Record<string, unknown>;
  hash: string;
  meta: Meta;
}
