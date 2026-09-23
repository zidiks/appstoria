export interface Paginated<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  }
}
