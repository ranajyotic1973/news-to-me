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
  static parseGeneratedContent(content: string): NewsStory[] {
    const stories: NewsStory[] = [];

    try {
      // Try pure JSON format first
      try {
        const parsed = JSON.parse(content);
        if (parsed.stories && Array.isArray(parsed.stories)) {
          return this.parseJsonFormat(parsed);
        }
      } catch (e) {
        // Not pure JSON, continue to next format
      }

      // Try markdown with embedded JSON array (## Top News - Date followed by JSON array)
      console.log('[StoryFormattingService] Parsing markdown format with embedded JSON array');
      const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        return this.parseJsonArrayFormat(jsonMatch[0]);
      }

      // Fallback: Try old markdown format with SVG code blocks
      console.log('[StoryFormattingService] Parsing markdown format with SVG code blocks');
      return this.parseMarkdownFormat(content);
    } catch (error) {
      console.error('[StoryFormattingService] Failed to parse content:', error);
      console.error('[StoryFormattingService] LLM Response:', content.substring(0, 500));
    }

    return stories;
  }

  private static parseJsonFormat(data: any): NewsStory[] {
    const stories: NewsStory[] = [];

    if (!data.stories || !Array.isArray(data.stories)) {
      console.error('[StoryFormattingService] Invalid JSON format - stories array missing');
      return stories;
    }

    for (const story of data.stories) {
      try {
        if (!story.headline || !story.summary || !story.category) {
          console.warn('[StoryFormattingService] Story missing required fields');
          continue;
        }

        let imageUrl: string | undefined;
        if (story.svg) {
          const encodedSvg = encodeURIComponent(story.svg);
          imageUrl = `data:image/svg+xml,${encodedSvg}`;
        } else {
          imageUrl = this.generateFallbackSvg(story.category);
        }

        stories.push({
          id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          headline: story.headline,
          summary: story.summary,
          category: story.category.toLowerCase() as 'business' | 'stock-market' | 'sports' | 'math',
          imageUrl,
        });
      } catch (error) {
        console.error('[StoryFormattingService] Error parsing story:', error);
      }
    }

    return stories;
  }

  private static parseJsonArrayFormat(jsonStr: string): NewsStory[] {
    const stories: NewsStory[] = [];
    const parsedStories = JSON.parse(jsonStr);

    if (!Array.isArray(parsedStories)) {
      console.error('[StoryFormattingService] LLM response is not an array');
      return stories;
    }

    for (const story of parsedStories) {
      try {
        if (!story.headline || !story.summary || !story.category) {
          console.error('[StoryFormattingService] ✗ Story missing required fields');
          continue;
        }

        let imageUrl: string | undefined;
        if (story.svg || story.svgImage) {
          const svg = story.svg || story.svgImage;
          const encodedSvg = encodeURIComponent(svg);
          imageUrl = `data:image/svg+xml,${encodedSvg}`;
        } else {
          imageUrl = this.generateFallbackSvg(story.category);
        }

        stories.push({
          id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          headline: story.headline,
          summary: story.summary,
          category: story.category.toLowerCase() as 'business' | 'stock-market' | 'sports' | 'math',
          imageUrl,
        });
      } catch (error) {
        console.error('[StoryFormattingService] Error parsing story:', error);
      }
    }

    return stories;
  }

  private static parseMarkdownFormat(content: string): NewsStory[] {
    const stories: NewsStory[] = [];

    // Prefer splitting on markdown headings (### Story N). If the model didn't
    // use headings but did label multiple stories, split on the Headline label
    // instead so we still recover each story.
    let storyBlocks = content.split(/(?:^|\n)#{1,3}\s+/).filter((b) => b.trim());
    const headlineLabels = (content.match(/\*{0,2}Headline\*{0,2}\s*[:\-]/gi) || []).length;
    if (storyBlocks.length <= 1 && headlineLabels > 1) {
      storyBlocks = content
        .split(/(?=\*{0,2}Headline\*{0,2}\s*[:\-])/i)
        .filter((b) => /Headline/i.test(b));
    }

    for (const block of storyBlocks) {
      if (!block.trim()) continue;

      // Skip non-story blocks (e.g. the "## Top News - <date>" title that
      // precedes the first story) — they have no summary or SVG.
      if (!/summary/i.test(block) && !/<svg|```svg/i.test(block)) continue;

      try {
        const story = this.parseStoryBlock(block);
        if (story) {
          stories.push(story);
        }
      } catch (error) {
        console.error('[StoryFormattingService] Failed to parse story block:', error);
      }
    }

    return stories;
  }

  /**
   * Tolerantly extracts a story from a markdown block. Handles common LLM
   * format variations: labels with or without asterisks/colons, the headline
   * being the block's heading line, prose summaries without a label, and SVGs
   * in a ```svg fence or inline <svg> tags.
   */
  private static parseStoryBlock(block: string): NewsStory | null {
    try {
      const lines = block.split('\n').map((l) => l.trim());
      const headingLine = lines.find((l) => l.length > 0) || '';
      const isLabel = (l: string) =>
        /^\*{0,2}(headline|summary|source|category|image)\b/i.test(l);

      // Headline: labeled, else the block's heading line (stripped of markup).
      const headlineMatch = block.match(/\*{0,2}Headline\*{0,2}\s*[:\-]\s*(.+?)(?:\n|$)/i);
      let headline = headlineMatch
        ? headlineMatch[1].replace(/^[\s:*]+/, '').replace(/[\s*]+$/, '').trim()
        : null;
      if (!headline && headingLine && !isLabel(headingLine)) {
        headline = headingLine.replace(/^#+\s*/, '').replace(/^\*+|\*+$/g, '').trim();
      }

      // Summary: labeled, else the first prose (non-label, non-svg, non-heading).
      const summaryMatch = block.match(
        /\*{0,2}Summary\*{0,2}\s*[:\-]\s*([\s\S]+?)(?=\n\s*\*{0,2}(?:Source|Category|Headline|Image)\b|\n\s*```|\n\n|$)/i
      );
      let summary = summaryMatch ? summaryMatch[1].trim() : null;
      if (!summary) {
        const prose = lines.filter(
          (l) =>
            l &&
            l !== headingLine &&
            !isLabel(l) &&
            !/^```/.test(l) &&
            !/^<svg/i.test(l) &&
            !/^#+/.test(l)
        );
        summary = prose.length ? prose.join(' ').slice(0, 600) : null;
      }
      if (summary) {
        summary = summary.replace(/\*\*/g, '').trim();
      }

      // Category: labeled, normalized.
      const categoryMatch = block.match(/\*{0,2}Category\*{0,2}\s*[:\-]\s*(.+?)(?:\n|$)/i);
      let category = categoryMatch
        ? categoryMatch[1].replace(/[*`]/g, '').trim().toLowerCase()
        : 'business';
      if (!['business', 'stock-market', 'sports', 'math'].includes(category)) {
        category = 'business';
      }

      // SVG: fenced ```svg block, else an inline <svg>...</svg>.
      const svgFence = block.match(/```svg\s*([\s\S]*?)```/i);
      const svgInline = block.match(/<svg[\s\S]*?<\/svg>/i);
      const svgCode = svgFence ? svgFence[1].trim() : svgInline ? svgInline[0].trim() : null;
      const imageUrl = svgCode
        ? `data:image/svg+xml,${encodeURIComponent(svgCode)}`
        : this.generateFallbackSvg(category);

      if (!headline || !summary) {
        console.warn('[StoryFormattingService] Story missing headline or summary');
        return null;
      }

      return {
        id: `story-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        headline,
        summary,
        category: category as 'business' | 'stock-market' | 'sports' | 'math',
        imageUrl,
      };
    } catch (error) {
      console.error('[StoryFormattingService] Error parsing story block:', error);
      return null;
    }
  }

  private static generateFallbackSvg(category: string): string {
    const categoryColors: { [key: string]: string } = {
      'business': '#4CAF50',
      'stock-market': '#2196F3',
      'sports': '#F44336',
      'math': '#9C27B0',
    };
    const color = categoryColors[category] || '#607D8B';
    const fallbackSvg = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="${color}"/><text x="100" y="100" font-size="16" text-anchor="middle" fill="white" dominant-baseline="middle">${category}</text></svg>`;
    const encodedSvg = encodeURIComponent(fallbackSvg);
    return `data:image/svg+xml,${encodedSvg}`;
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
      stories.length > 0 &&
      stories.every(
        (story) =>
          story.headline &&
          story.summary &&
          ['business', 'stock-market', 'sports', 'math'].includes(story.category)
      )
    );
  }
}
