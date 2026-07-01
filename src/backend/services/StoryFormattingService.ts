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
  static extractSVGFromText(text: string): string | null {
    // Extract SVG content from text (e.g., "- SVGImage: <svg>...</svg>")
    const svgMatch = text.match(/SVGImage:\s*(<svg[^<]*(?:<[^>]*>)*<\/svg>)/i);
    if (svgMatch && svgMatch[1]) {
      return svgMatch[1];
    }
    return null;
  }

  static parseGeneratedContent(content: string): NewsStory[] {
    const stories: NewsStory[] = [];
    const storyBlocks = content.split(/(?=- Headline:)/);

    for (const block of storyBlocks) {
      if (!block.trim()) continue;

      const headlineMatch = block.match(/- Headline:\s*(.+?)(?:\n|$)/);
      const summaryMatch = block.match(/- Summary:\s*(.+?)(?=- Category:|$)/s);
      const categoryMatch = block.match(/- Category:\s*(business|stock-market|sports|math)/i);
      const svgMatch = block.match(/- SVGImage:\s*(<svg[^<]*(?:<[^>]*>)*<\/svg>)/i);

      if (headlineMatch && summaryMatch && categoryMatch) {
        let summary = summaryMatch[1].trim();
        const headline = headlineMatch[1].trim();
        const svgContent = svgMatch ? svgMatch[1].trim() : '';

        // Remove [IMAGE:...] tags from summary if they exist
        summary = summary.replace(/\s*\[IMAGE:[^\]]*\]\s*/g, '');

        // Use SVG content as data URL if available
        let imageUrl: string | undefined;
        if (svgContent) {
          // Encode SVG as data URL for inline display
          const encodedSvg = encodeURIComponent(svgContent);
          imageUrl = `data:image/svg+xml,${encodedSvg}`;
        }

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
