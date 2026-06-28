export interface NewsStory {
  id: string;
  headline: string;
  summary: string;
  category: 'business' | 'stock-market' | 'sports' | 'math';
  imageUrl?: string;
}

export interface NewspaperPage {
  pageNumber: number;
  totalPages: number;
  stories: NewsStory[];
}

export class StoryFormattingService {
  static generatePlaceholderImage(category: string, index: number): string {
    // Generate placeholder images from Picsum (Lorempicsum alternative)
    const width = 400;
    const height = 300;
    const seed = `${category}-${index}-${Date.now()}`;
    return `https://picsum.photos/${width}/${height}?random=${encodeURIComponent(seed)}`;
  }

  static parseGeneratedContent(content: string): NewsStory[] {
    const stories: NewsStory[] = [];
    const storyBlocks = content.split(/(?=- Headline:)/);
    let storyIndex = 0;

    for (const block of storyBlocks) {
      if (!block.trim()) continue;

      const headlineMatch = block.match(/- Headline:\s*(.+?)(?:\n|$)/);
      const summaryMatch = block.match(/- Summary:\s*(.+?)(?=- Category:|$)/s);
      const categoryMatch = block.match(/- Category:\s*(business|stock-market|sports|math)/i);
      const imageMatch = block.match(/\[IMAGE:\s*(.+?)\s*\]/);

      if (headlineMatch && summaryMatch && categoryMatch) {
        let summary = summaryMatch[1].trim();

        // Extract image URL if present, otherwise generate placeholder
        let imageUrl = imageMatch ? imageMatch[1].trim() : undefined;

        // Remove [IMAGE:...] tags from summary
        summary = summary.replace(/\s*\[IMAGE:[^\]]*\]\s*/g, '');

        // Generate placeholder if no image provided
        if (!imageUrl || imageUrl.toLowerCase() === 'not available') {
          const category = categoryMatch[1].toLowerCase();
          imageUrl = StoryFormattingService.generatePlaceholderImage(category, storyIndex);
        }

        stories.push({
          id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          headline: headlineMatch[1].trim(),
          summary: summary,
          category: categoryMatch[1].toLowerCase() as 'business' | 'stock-market' | 'sports' | 'math',
          imageUrl: imageUrl,
        });

        storyIndex++;
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
