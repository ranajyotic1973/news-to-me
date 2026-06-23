import axios from 'axios';
import { NewsSource, NewsArticle, NewsSourceConfig } from './NewsSource';

export class RealNewsSource extends NewsSource {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';

  constructor(config: NewsSourceConfig & { apiKey?: string }) {
    super(config);
    // Use environment variable or config
    this.apiKey = config.apiKey || process.env.NEWS_API_KEY || '';

    if (!this.apiKey) {
      console.warn(
        'NewsAPI key not configured. Set NEWS_API_KEY environment variable or provide apiKey in config. Falling back to mock data.'
      );
    }
  }

  async fetchLatestNews(query: string, limit: number): Promise<NewsArticle[]> {
    if (!this.apiKey) {
      // Return empty array if no API key - fallback to mock will be handled
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: query,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: limit,
          apiKey: this.apiKey,
        },
      });

      if (!response.data.articles) {
        return [];
      }

      return response.data.articles.map((article: any) => ({
        id: this.generateArticleId(article.title, 'real'),
        title: article.title,
        description: article.description || article.content || '',
        source: article.source.name,
        publishedAt: article.publishedAt,
        url: article.url,
      }));
    } catch (error) {
      console.error('Error fetching news from NewsAPI:', error);
      return [];
    }
  }

  async fetchNewsByCountry(countryCode: string, limit: number): Promise<NewsArticle[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          country: countryCode,
          pageSize: limit,
          apiKey: this.apiKey,
        },
      });

      if (!response.data.articles) {
        return [];
      }

      return response.data.articles.map((article: any) => ({
        id: this.generateArticleId(article.title, 'real'),
        title: article.title,
        description: article.description || article.content || '',
        source: article.source.name,
        publishedAt: article.publishedAt,
        url: article.url,
      }));
    } catch (error) {
      console.error('Error fetching country news from NewsAPI:', error);
      return [];
    }
  }
}
