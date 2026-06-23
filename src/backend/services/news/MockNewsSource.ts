import { NewsSource, NewsArticle, NewsSourceConfig } from './NewsSource';

export class MockNewsSource extends NewsSource {
  constructor(config: NewsSourceConfig) {
    super(config);
  }

  async fetchLatestNews(_query: string, limit: number): Promise<NewsArticle[]> {
    const mockArticles: NewsArticle[] = [
      {
        id: this.generateArticleId('Tech IPO', 'mock'),
        title: 'New Technology Company Files for IPO',
        description:
          'A promising tech startup announced plans to go public next quarter, expected to raise significant capital.',
        source: 'MockNews',
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/1',
      },
      {
        id: this.generateArticleId('Market Rally', 'mock'),
        title: 'Stock Markets Reach Record High',
        description:
          'Global stock indices surge as investors show renewed confidence in economic growth prospects.',
        source: 'MockNews',
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/2',
      },
      {
        id: this.generateArticleId('Corporate Earnings', 'mock'),
        title: 'Major Retailer Reports Strong Quarterly Earnings',
        description:
          'Earnings beat expectations as online sales continue to drive growth for the consumer retail sector.',
        source: 'MockNews',
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/3',
      },
      {
        id: this.generateArticleId('Tech Stocks', 'mock'),
        title: 'Technology Sector Outperforms Market',
        description:
          'Cloud computing and AI companies lead market gains as institutional investors increase allocation.',
        source: 'MockNews',
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/4',
      },
      {
        id: this.generateArticleId('Market Analysis', 'mock'),
        title: 'Analysts Forecast Continued Growth',
        description:
          'Investment banks raise price targets for major indices as economic indicators remain positive.',
        source: 'MockNews',
        publishedAt: new Date().toISOString(),
        url: 'https://example.com/5',
      },
    ];

    return mockArticles.slice(0, limit);
  }
}
