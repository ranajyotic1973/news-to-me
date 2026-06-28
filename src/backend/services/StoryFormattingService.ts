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
  static generateImageSearchUrl(query: string): string {
    // Use Unsplash API with search query for relevant images
    // Query is URL-encoded and used to search for images matching the story
    const encodedQuery = encodeURIComponent(query.substring(0, 50)); // Limit query length
    // Using Unsplash source which provides free stock images
    return `https://source.unsplash.com/600x400/?${encodedQuery}`;
  }

  static extractImageQuery(headline: string, imageDescription: string): string {
    // Create search query from headline and image description
    // Use image description as primary, fallback to headline
    if (imageDescription && imageDescription.toLowerCase() !== 'not available') {
      return imageDescription;
    }

    // Fallback: extract key terms from headline
    return headline.split(' ').slice(0, 3).join(' ');
  }

  static parseGeneratedContent(content: string): NewsStory[] {
    const stories: NewsStory[] = [];
    const storyBlocks = content.split(/(?=- Headline:)/);

    for (const block of storyBlocks) {
      if (!block.trim()) continue;

      const headlineMatch = block.match(/- Headline:\s*(.+?)(?:\n|$)/);
      const summaryMatch = block.match(/- Summary:\s*(.+?)(?=- Category:|$)/s);
      const categoryMatch = block.match(/- Category:\s*(business|stock-market|sports|math)/i);
      const imageMatch = block.match(/- Image:\s*(.+?)(?:\n|$)/);

      if (headlineMatch && summaryMatch && categoryMatch) {
        let summary = summaryMatch[1].trim();
        const headline = headlineMatch[1].trim();
        const imageDescription = imageMatch ? imageMatch[1].trim() : '';

        // Remove [IMAGE:...] tags from summary if they exist
        summary = summary.replace(/\s*\[IMAGE:[^\]]*\]\s*/g, '');

        // Generate image URL based on image description or headline
        const imageQuery = StoryFormattingService.extractImageQuery(headline, imageDescription);
        const imageUrl = StoryFormattingService.generateImageSearchUrl(imageQuery);

        stories.push({
          id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          headline: headline,
          summary: summary,
          category: categoryMatch[1].toLowerCase() as 'business' | 'stock-market' | 'sports' | 'math',
          imageUrl: imageUrl,
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
