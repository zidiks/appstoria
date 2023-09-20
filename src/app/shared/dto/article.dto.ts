import { ApiId, ApiTimestamp } from "../models/api-data.model";

export interface ArticleResponseDto extends ApiId, ApiTimestamp {
  media: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
}

export interface ArticlePrevResponseDto extends ApiId, ApiTimestamp {
  media: string;
  title: string;
  description: string;
  tags: string[];
}

export interface AddArticleRequestDto {
  media: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
}

export interface UpdateArticleRequestDto extends AddArticleRequestDto { }
