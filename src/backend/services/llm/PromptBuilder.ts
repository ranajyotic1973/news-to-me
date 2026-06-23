import { NewsArticle } from '../news/NewsSource';

export interface PromptContext {
  childAge: number;
  childCountry: string;
  country?: string;
  stockMarketIndex?: string;
  currency?: string;
}

export class PromptBuilder {
  static buildLLMNewsGenerationPrompt(context: PromptContext): string {
    const ageAppropriateGuidance = this.getAgeAppropriateGuidance(context.childAge);
    const countryContext = context.stockMarketIndex
      ? `The primary stock market index for ${context.childCountry} is the ${context.stockMarketIndex}.`
      : '';

    return `Create 4 news stories for a ${context.childAge}-year-old.

${ageAppropriateGuidance}
${countryContext}

For EACH story, write EXACTLY in this format:

- Headline: [headline with company name and number]
- Summary: [2-3 sentences with company names, numbers, stock ticker]
- Category: [business, stock-market, sports, or math]

Example:
- Headline: Apple Inc. Reports $81.8 Billion Revenue
- Summary: Apple (AAPL) announced Q3 earnings of $81.8 billion, up 5.2% year-over-year. iPhone sales reached $34.4 billion representing 42% of revenue. The company's stock surged 4.7% to $189.45.
- Category: business

Guidelines:
- Include real company names with stock tickers (e.g., AAPL, MSFT, TSLA)
- Add specific numbers, percentages, financial figures kids can explore
- Mix business, stock-market, sports, and math stories equally
- Include fiction stories (fairy tales, adventures, mysteries) to keep it engaging
- Make stories educational and explorable
- DO NOT include [IMAGE: ...] or image descriptions in the summary
- Focus on storytelling, not visuals

Generate 4 stories now:`;
  }

  static buildNewsGenerationPrompt(
    articles: NewsArticle[],
    context: PromptContext
  ): string {
    const articlesText = articles
      .map(
        (article, idx) =>
          `${idx + 1}. Title: ${article.title}\n   Description: ${article.description}`
      )
      .join('\n\n');

    const ageAppropriateGuidance = this.getAgeAppropriateGuidance(context.childAge);
    const countryContext = context.stockMarketIndex
      ? `The primary stock market index for ${context.childCountry} is the ${context.stockMarketIndex}.`
      : '';

    return `You are creating engaging news stories for a ${context.childAge}-year-old who wants to learn about business, finance, sports, and have fun!

${ageAppropriateGuidance}

${countryContext}

IMPORTANT: Mix real news with engaging fiction stories to keep kids interested while learning!

Based on these news articles:
${articlesText}

Create SHORT, DETAILED news stories and fiction. For EACH story, format as:
- Headline: [catchy, specific headline with company names, numbers when possible]
- Summary: [2-4 sentences with RICH DETAILS including:
  * Specific company names and stock tickers (e.g., Apple Inc. (AAPL))
  * Real numbers, percentages, and financial figures (e.g., "revenue of $81.8 billion", "stock jumped 4.7%")
  * Key metrics kids can explore (market cap, P/E ratios, revenue growth)
  * [IMAGE: brief description of what image would show] - always include an image reference!
]
- Category: [business, stock-market, sports, or math]

STORY TYPES (mix these):
1. BUSINESS NEWS: Include specific companies, revenue figures, profit numbers, employee counts
2. STOCK MARKET: Include ticker symbols, price changes (%), index levels, analyst predictions
3. SPORTS: Include scores, statistics, player names, championship names
4. MATH: Include mathematical challenges, olympiad problems, or educational puzzle stories
5. FICTION (20% of stories): Fairy tales, adventure stories, detective mysteries to keep engagement high

REQUIREMENTS:
- Include real numbers, percentages, and financial data kids can analyze
- Always include [IMAGE: description] for visualization
- Make stories explorable - kids should want to research companies/people mentioned
- Keep language appropriate but don't dumb down the content
- Mix serious learning with fun fiction stories
- Focus on stories from ${context.childCountry}

Generate 4 diverse stories mixing all types. Transform the provided articles with REAL details.`;
  }

  static buildTopicFilterPrompt(content: string): string {
    return `You are a content filter for a kids' news app (ages 10-16).

Analyze this content and determine if it's appropriate and focused on ONLY these topics:
1. Business news (companies, industries, corporate news)
2. Stock market news (stocks, indices, investing)
3. Sports news (teams, games, athletes)
4. Math & Education (math olympiad, educational stories, science)
5. Fiction stories (adventure, mysteries, fairy tales for engagement)

Content to analyze:
"${content}"

Respond with JSON:
{
  "allowed": true/false,
  "category": "business|stock-market|sports|math|fiction|other",
  "reason": "brief explanation"
}

Reject content about politics, adult entertainment, violence, or inappropriate topics.`;
  }

  private static getAgeAppropriateGuidance(age: number): string {
    if (age < 12) {
      return `Use very simple language, short sentences, and real-world examples a ${age}-year-old can relate to (games, school, allowance).
Explain financial concepts with analogies. Avoid jargon or explain it clearly.
Focus on "why this matters to you" angle.`;
    } else if (age < 14) {
      return `Use clear, accessible language with some financial terminology explained.
Connect concepts to their interests and future (college, career, saving).
Include brief explanations of how markets work.`;
    } else {
      return `Can use more sophisticated financial concepts but still keep it engaging.
Explain cause-and-effect relationships in markets.
Focus on how news impacts real people and economies.`;
    }
  }
}
