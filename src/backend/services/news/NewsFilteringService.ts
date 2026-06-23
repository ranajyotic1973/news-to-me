import { NewsArticle } from './NewsSource';

export type NewsCategory = 'business' | 'stock-market' | 'sports' | 'other';

export class NewsFilteringService {
  private stockMarketKeywords = [
    'stock',
    'market',
    'index',
    'shares',
    'investor',
    'portfolio',
    'dividend',
    'earnings',
    'ipo',
    'sec',
    'nasdaq',
    's&p',
    'dow',
    'bull',
    'bear',
    'trading',
    'equity',
  ];

  private businessKeywords = [
    'business',
    'company',
    'corporate',
    'ceo',
    'retail',
    'finance',
    'bank',
    'industry',
    'enterprise',
    'commerce',
    'deal',
    'merger',
    'acquisition',
    'expansion',
    'growth',
    'revenue',
    'profit',
  ];

  private sportsKeywords = ['sport', 'game', 'team', 'player', 'league', 'championship', 'match', 'score'];

  categorizeArticle(article: NewsArticle): NewsCategory {
    const text = `${article.title} ${article.description}`.toLowerCase();

    const stockMarketScore = this.stockMarketKeywords.filter((kw) => text.includes(kw)).length;
    const businessScore = this.businessKeywords.filter((kw) => text.includes(kw)).length;
    const sportsScore = this.sportsKeywords.filter((kw) => text.includes(kw)).length;

    if (stockMarketScore > businessScore && stockMarketScore > sportsScore && stockMarketScore > 0) {
      return 'stock-market';
    }

    if (businessScore > sportsScore && businessScore > 0) {
      return 'business';
    }

    if (sportsScore > 0) {
      return 'sports';
    }

    return 'other';
  }

  filterAllowedContent(articles: NewsArticle[]): NewsArticle[] {
    return articles.filter((article) => {
      const category = this.categorizeArticle(article);
      return category !== 'other';
    });
  }

  prioritizeByCategory(articles: NewsArticle[]): NewsArticle[] {
    const categorized = articles.map((article) => ({
      article,
      category: this.categorizeArticle(article),
    }));

    const categoryPriority: { [key in NewsCategory]: number } = {
      'stock-market': 3,
      business: 2,
      sports: 1,
      other: 0,
    };

    return categorized
      .sort((a, b) => categoryPriority[b.category] - categoryPriority[a.category])
      .map((item) => item.article);
  }
}
