import { ApiId } from "./api-data.model";

export interface SeoModel extends ApiId {
  title: string;
  description: string;
  keywords: string[];
  tag: string;
  content: string;
  url: string;
}
