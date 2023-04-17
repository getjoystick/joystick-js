export interface Meta {
  uid: number;
  mod: number;
  variants: object[];
  seg: object[];
}

export interface ApiResponse<TData = any> {
  data: TData;
  hash: string;
  meta: Meta;
}
