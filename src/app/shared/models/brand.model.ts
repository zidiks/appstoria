import { ApiId } from "./api-data.model";

export interface BrandModel extends ApiId {
  name: string;
  description?: string;
  origin: string;
}
