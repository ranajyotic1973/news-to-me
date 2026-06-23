export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
}

export interface NewsSourceConfig {
  apiKey?: string;
  baseUrl: string;
}

export abstract class NewsSource {
  protected config: NewsSourceConfig;

  constructor(config: NewsSourceConfig) {
    this.config = config;
  }

  abstract fetchLatestNews(query: string, limit: number): Promise<NewsArticle[]>;

  protected generateArticleId(_title: string, source: string): string {
    return `${source}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
