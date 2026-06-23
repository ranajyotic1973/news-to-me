import { describe, it, expect } from 'vitest';
import { NewsFilteringService } from './news/NewsFilteringService';
import { NewsArticle } from './news/NewsSource';

describe('NewsFilteringService', () => {
  const service = new NewsFilteringService();

  const mockArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'Stock Market Reaches Record High',
      description: 'S&P 500 index surges as investors gain confidence',
      source: 'Finance Daily',
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/1',
    },
    {
      id: '2',
      title: 'Apple Reports Strong Earnings',
      description: 'Tech company beats revenue expectations',
      source: 'Business News',
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/2',
    },
    {
      id: '3',
      title: 'Local Team Wins Championship',
      description: 'Sports team celebrates victory',
      source: 'Sports',
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/3',
    },
    {
      id: '4',
      title: 'Weather Tomorrow',
      description: 'Sunny with mild temperatures expected',
      source: 'Weather',
      publishedAt: new Date().toISOString(),
      url: 'https://example.com/4',
    },
  ];

  it('should categorize stock market article', () => {
    const category = service.categorizeArticle(mockArticles[0]);
    expect(category).toBe('stock-market');
  });

  it('should categorize business article', () => {
    const category = service.categorizeArticle(mockArticles[1]);
    expect(category).toBe('business');
  });

  it('should categorize sports article', () => {
    const category = service.categorizeArticle(mockArticles[2]);
    expect(category).toBe('sports');
  });

  it('should categorize irrelevant content as other', () => {
    const category = service.categorizeArticle(mockArticles[3]);
    expect(category).toBe('other');
  });

  it('should filter out non-allowed content', () => {
    const filtered = service.filterAllowedContent(mockArticles);
    expect(filtered).toHaveLength(3);
    expect(filtered.find((a) => a.id === '4')).toBeUndefined();
  });

  it('should prioritize by category', () => {
    const prioritized = service.prioritizeByCategory(mockArticles);
    expect(prioritized[0].id).toBe('1');
    expect(prioritized[1].id).toBe('2');
    expect(prioritized[2].id).toBe('3');
  });
});
