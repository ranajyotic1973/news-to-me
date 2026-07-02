export type NewsCategory = 'stock-market' | 'business' | 'sports' | 'math';

export interface NewsPortal {
  name: string;
  /** RSS/Atom feed URL. */
  url: string;
  category: NewsCategory;
}

/**
 * Curated registry of well-known news-portal RSS feeds, organized by country
 * and subject. RSS is used instead of scraping HTML because most portal pages
 * are JavaScript-heavy SPAs whose real content isn't in the served HTML — RSS
 * feeds are clean, server-rendered XML (title + summary + link + date), aren't
 * bot-blocked, and cost almost no tokens.
 *
 * Every feed below was verified to return valid XML with multiple items.
 * Country keys match the names the app passes as `childCountry`; unknown
 * countries fall back to `default`. Math/education feeds are shared.
 */
export class NewsPortalRegistry {
  private static readonly mathPortals: NewsPortal[] = [
    { name: 'Science News Explores', url: 'https://www.snexplores.org/feed', category: 'math' },
    { name: 'ScienceDaily Mathematics', url: 'https://www.sciencedaily.com/rss/computers_math/mathematics.xml', category: 'math' },
  ];

  private static readonly portals: { [country: string]: NewsPortal[] } = {
    India: [
      { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', category: 'stock-market' },
      { name: 'Moneycontrol Business', url: 'https://www.moneycontrol.com/rss/business.xml', category: 'business' },
      { name: 'Hindustan Times Sports', url: 'https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml', category: 'sports' },
      { name: 'Times of India Sports', url: 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms', category: 'sports' },
    ],
    USA: [
      { name: 'CNBC Markets', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', category: 'stock-market' },
      { name: 'CNBC Business', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', category: 'business' },
      { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
    ],
    UK: [
      { name: 'CNBC Markets', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', category: 'stock-market' },
      { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'business' },
      { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
    ],
    Canada: [
      { name: 'CNBC Markets', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', category: 'stock-market' },
      { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'business' },
      { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
    ],
    Australia: [
      { name: 'CNBC Markets', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', category: 'stock-market' },
      { name: 'ABC News Business', url: 'https://www.abc.net.au/news/feed/51892/rss.xml', category: 'business' },
      { name: 'ABC Sport', url: 'https://www.abc.net.au/news/feed/45924/rss.xml', category: 'sports' },
    ],
    default: [
      { name: 'CNBC Markets', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', category: 'stock-market' },
      { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'business' },
      { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports' },
    ],
  };

  // Geography → Google News locale. `hl` is language, `gl` is geography; `ceid`
  // (edition) is derived from geography (we only care about geography + latest).
  private static readonly googleNewsLocale: {
    [country: string]: { hl: string; gl: string };
  } = {
    India: { hl: 'en-IN', gl: 'IN' },
    USA: { hl: 'en-US', gl: 'US' },
    UK: { hl: 'en-GB', gl: 'GB' },
    Canada: { hl: 'en-CA', gl: 'CA' },
    Australia: { hl: 'en-AU', gl: 'AU' },
    default: { hl: 'en-US', gl: 'US' },
  };

  private static readonly googleNewsQueries: { query: string; category: NewsCategory }[] = [
    { query: 'stock market', category: 'stock-market' },
    { query: 'business', category: 'business' },
    { query: 'sports', category: 'sports' },
    { query: 'mathematics', category: 'math' },
  ];

  /**
   * Builds localized Google News RSS search feeds (one per subject) for a
   * country. `when:7d` keeps results recent ("always latest"); geography drives
   * `gl`/`hl`/`ceid` so results are localized to the child's country.
   */
  private static buildGoogleNewsPortals(country: string): NewsPortal[] {
    const locale = this.googleNewsLocale[country] || this.googleNewsLocale.default;
    const lang = locale.hl.split('-')[0];
    const ceid = `${locale.gl}:${lang}`;
    return this.googleNewsQueries.map(({ query, category }) => ({
      name: `Google News ${country} (${category})`,
      url: `https://news.google.com/rss/search?q=${encodeURIComponent(
        `${query} when:7d`
      )}&hl=${locale.hl}&gl=${locale.gl}&ceid=${ceid}`,
      category,
    }));
  }

  /**
   * Returns the feeds for a country: curated portal feeds, localized Google News
   * search feeds, and shared math feeds. Falls back to `default` for unknown
   * countries.
   */
  static getPortals(country: string): NewsPortal[] {
    const countryPortals = this.portals[country] || this.portals.default;
    return [
      ...countryPortals,
      ...this.buildGoogleNewsPortals(country),
      ...this.mathPortals,
    ];
  }
}
