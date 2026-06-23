import { describe, it, expect } from 'vitest';
import { StoryFormattingService } from './StoryFormattingService';

describe('StoryFormattingService', () => {
  const mockGeneratedContent = `
- Headline: Tech Company Reports Growth
- Summary: A major technology company announced strong quarterly results, showing increased revenue from cloud services.
- Category: business

- Headline: Stock Market Hits New Peak
- Summary: The S&P 500 index reached record levels today as investors respond positively to economic data.
- Category: stock-market

- Headline: Team Wins Important Match
- Summary: The home team defeated their rivals in an exciting championship match.
- Category: sports
  `;

  it('should parse generated content into stories', () => {
    const stories = StoryFormattingService.parseGeneratedContent(mockGeneratedContent);
    expect(stories.length).toBeGreaterThan(0);
    expect(stories[0]).toHaveProperty('headline');
    expect(stories[0]).toHaveProperty('summary');
    expect(stories[0]).toHaveProperty('category');
  });

  it('should create pages from stories', () => {
    const stories = Array.from({ length: 10 }, (_, i) => ({
      id: `story-${i}`,
      headline: `Headline ${i}`,
      summary: `Summary ${i}`,
      category: 'business' as const,
    }));

    const pages = StoryFormattingService.createPages(stories, 3);
    expect(pages.length).toBe(4);
    expect(pages[0].pageNumber).toBe(1);
    expect(pages[0].stories.length).toBe(3);
  });

  it('should set correct total pages', () => {
    const stories = Array.from({ length: 10 }, (_, i) => ({
      id: `story-${i}`,
      headline: `Headline ${i}`,
      summary: `Summary ${i}`,
      category: 'business' as const,
    }));

    const pages = StoryFormattingService.createPages(stories, 3);
    pages.forEach((page) => {
      expect(page.totalPages).toBe(4);
    });
  });

  it('should handle empty stories', () => {
    const pages = StoryFormattingService.createPages([], 4);
    expect(pages.length).toBe(1);
    expect(pages[0].stories.length).toBe(0);
  });

  it('should validate correct stories', () => {
    const validStories = [
      {
        id: '1',
        headline: 'Test',
        summary: 'Test summary',
        category: 'business' as const,
      },
    ];
    expect(StoryFormattingService.validateStories(validStories)).toBe(true);
  });

  it('should reject invalid stories', () => {
    const invalidStories = [
      {
        id: '1',
        headline: '',
        summary: 'Test summary',
        category: 'business' as const,
      },
    ];
    expect(StoryFormattingService.validateStories(invalidStories)).toBe(false);
  });
});
