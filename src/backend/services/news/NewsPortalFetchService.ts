import axios from 'axios';
import { NewsPortalRegistry, NewsPortal } from './NewsPortalRegistry';

export interface FetchedPortal {
  name: string;
  url: string;
  category: string;
  /** Formatted list of recent headlines + summaries from the feed. */
  text: string;
  /** Number of items parsed from the feed. */
  itemCount: number;
}

interface FeedItem {
  title: string;
  description: string;
}

/**
 * Fetches real news-portal RSS/Atom feeds and turns them into a compact list of
 * recent headlines + summaries for the LLM to build stories from. RSS is used
 * instead of scraping HTML because portal pages are JS-heavy SPAs; feeds are
 * clean XML, aren't bot-blocked, and cost almost no tokens.
 *
 * Tolerates per-feed failures (timeouts, blocks, malformed XML) by skipping
 * them. Single responsibility: retrieving and parsing portal feeds.
 */
export class NewsPortalFetchService {
  private static readonly USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
  private static readonly REQUEST_TIMEOUT_MS = 8000;
  private static readonly PORTALS_PER_PAGE = 4;
  private static readonly MAX_ITEMS_PER_FEED = 10;
  private static readonly MAX_DESC_CHARS = 220;

  /**
   * Fetches a rotating subset of feeds for the given country. The subset rotates
   * by `pageNum` so different pages surface content from different feeds (helps
   * produce fresh, non-repeating stories per page).
   */
  async fetchPortalContent(country: string, pageNum: number): Promise<FetchedPortal[]> {
    const allPortals = NewsPortalRegistry.getPortals(country);
    const selected = this.selectPortalsForPage(allPortals, pageNum);

    const results = await Promise.all(
      selected.map((portal) => this.fetchSingle(portal))
    );

    // Keep only feeds that yielded at least one item.
    return results.filter((r): r is FetchedPortal => r !== null && r.itemCount > 0);
  }

  private selectPortalsForPage(portals: NewsPortal[], pageNum: number): NewsPortal[] {
    if (portals.length <= NewsPortalFetchService.PORTALS_PER_PAGE) {
      return portals;
    }
    const start =
      ((pageNum - 1) * NewsPortalFetchService.PORTALS_PER_PAGE) % portals.length;
    const selected: NewsPortal[] = [];
    for (let i = 0; i < NewsPortalFetchService.PORTALS_PER_PAGE; i++) {
      selected.push(portals[(start + i) % portals.length]);
    }
    return selected;
  }

  private async fetchSingle(portal: NewsPortal): Promise<FetchedPortal | null> {
    try {
      const response = await axios.get<string>(portal.url, {
        headers: {
          'User-Agent': NewsPortalFetchService.USER_AGENT,
          Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        },
        timeout: NewsPortalFetchService.REQUEST_TIMEOUT_MS,
        responseType: 'text',
        maxContentLength: 5 * 1024 * 1024,
        transformResponse: [(data) => data],
      });

      const items = this.parseFeed(response.data);
      const text = items
        .map((it, i) =>
          it.description ? `${i + 1}. ${it.title} — ${it.description}` : `${i + 1}. ${it.title}`
        )
        .join('\n');

      return {
        name: portal.name,
        url: portal.url,
        category: portal.category,
        text,
        itemCount: items.length,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[NewsPortalFetchService] Failed to fetch ${portal.url}: ${message}`);
      return null;
    }
  }

  /**
   * Parses an RSS (`<item>`) or Atom (`<entry>`) feed into title/description
   * pairs. Dependency-free: extracts item blocks and pulls the relevant tags,
   * handling CDATA and stripping any HTML inside descriptions.
   */
  private parseFeed(xml: string): FeedItem[] {
    if (!xml) return [];

    let blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi);
    if (!blocks || blocks.length === 0) {
      blocks = xml.match(/<entry\b[\s\S]*?<\/entry>/gi);
    }
    if (!blocks) return [];

    const items: FeedItem[] = [];
    for (const block of blocks.slice(0, NewsPortalFetchService.MAX_ITEMS_PER_FEED)) {
      const title = this.cleanText(
        this.firstTag(block, 'title')
      );
      const rawDesc =
        this.firstTag(block, 'description') ||
        this.firstTag(block, 'summary') ||
        this.firstTag(block, 'content');
      const description = this.cleanText(rawDesc).slice(
        0,
        NewsPortalFetchService.MAX_DESC_CHARS
      );

      if (title) {
        items.push({ title, description });
      }
    }
    return items;
  }

  private firstTag(block: string, tag: string): string {
    const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return match ? match[1] : '';
  }

  /**
   * Strips CDATA wrappers and HTML and decodes entities. Feeds vary: some
   * (Moneycontrol, Times of India) entity-encode embedded HTML (`&lt;img&gt;`),
   * and Google News double-encodes (`&amp;nbsp;`). So we decode entities twice
   * (with `&amp;` resolved last each pass so double-encoding unwinds correctly),
   * then strip any tags that decoding revealed.
   */
  private cleanText(raw: string): string {
    if (!raw) return '';
    let text = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

    for (let pass = 0; pass < 2; pass++) {
      text = text
        .replace(/&nbsp;|&#160;/gi, ' ')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&'); // resolve last so `&amp;nbsp;` unwinds next pass
    }

    return text
      .replace(/<[^>]+>/g, ' ') // strip literal and now-decoded tags
      .replace(/&#\d+;/g, ' ') // drop stray numeric entities
      .replace(/\s+/g, ' ')
      .trim();
  }
}
