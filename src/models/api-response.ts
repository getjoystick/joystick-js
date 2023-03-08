export interface Meta {
  uid: number;
  mod: number;
  seg: object[];
}

export interface ApiResponse {
  data: string;
  hash: string;
  meta: Meta;
}

export interface ApiResponseError {
  errors: Record<string, any>;
  title: string;
  status: number;
}
