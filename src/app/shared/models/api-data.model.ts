export type ApiDataModel<T> = T | undefined | null;

export interface ApiId {
  _id: string;
}

export interface ApiTimestamp {
  createdAt: string;
  updatedAt: string;
}
