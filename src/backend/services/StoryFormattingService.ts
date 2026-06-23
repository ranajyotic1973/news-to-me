export interface NewsStory {
  id: string;
  headline: string;
  summary: string;
  category: 'business' | 'stock-market' | 'sports' | 'math';
}

export interface NewspaperPage {
  pageNumber: number;
  totalPages: number;
  stories: NewsStory[];
}

export class StoryFormattingService {
  static parseGeneratedContent(content: string): NewsStory[] {
    const stories: NewsStory[] = [];
    const storyBlocks = content.split(/(?=- Headline:)/);

    for (const block of storyBlocks) {
      if (!block.trim()) continue;

      const headlineMatch = block.match(/- Headline:\s*(.+?)(?:\n|$)/);
      const summaryMatch = block.match(/- Summary:\s*(.+?)(?=- Category:|$)/s);
      const categoryMatch = block.match(/- Category:\s*(business|stock-market|sports|math)/i);

      if (headlineMatch && summaryMatch && categoryMatch) {
        let summary = summaryMatch[1].trim();

        // Remove any [IMAGE: ...] tags from summary
        summary = summary.replace(/\s*\[IMAGE:[^\]]*\]\s*/g, '');

        stories.push({
          id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          headline: headlineMatch[1].trim(),
          summary: summary,
          category: categoryMatch[1].toLowerCase() as 'business' | 'stock-market' | 'sports' | 'math',
        });
      }
    }

    return stories;
  }

  static createPages(stories: NewsStory[], storiesPerPage: number = 4): NewspaperPage[] {
    const pages: NewspaperPage[] = [];
    const totalPages = Math.ceil(stories.length / storiesPerPage);

    for (let i = 0; i < stories.length; i += storiesPerPage) {
      const pageNumber = Math.floor(i / storiesPerPage) + 1;
      pages.push({
        pageNumber,
        totalPages,
        stories: stories.slice(i, i + storiesPerPage),
      });
    }

    if (pages.length === 0) {
      pages.push({
        pageNumber: 1,
        totalPages: 1,
        stories: [],
      });
    }

    return pages;
  }

  static validateStories(stories: NewsStory[]): boolean {
    return (
      Array.isArray(stories) &&
      stories.every(
        (story) =>
          story.headline &&
          story.summary &&
          ['business', 'stock-market', 'sports', 'math'].includes(story.category)
      )
    );
  }
}
