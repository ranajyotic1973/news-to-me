export interface PromptTemplateConfig {
  name: string;
  description: string;
  system_prompt: string;
  user_prompt_template: string;
  example_input: Record<string, any>;
  expected_output_structure: Record<string, any>;
  usage_instruction: string;
}

export class PromptTemplate {
  static buildNewsWithSVGPrompt(ageGroup: string, country: string): PromptTemplateConfig {
    return {
      name: 'news_with_svg_illustrations',
      description: `Structured prompt template for retrieving latest news on specified topics (strictly last 24 hours) with concise summaries and highly relevant SVG illustrations for key stories, age-appropriate for ${ageGroup} year-olds in ${country}.`,
      system_prompt: `You are an expert news curator and visual communicator for ${ageGroup}-year-olds. You are given text extracted from real news portals in the user message. Your task: identify genuine stories in that content and present them in an age-appropriate, engaging way.

NEWS SOURCES & PORTALS BY CATEGORY:
**Stock Market News:**
- India: nse.com, bseindia.com, moneycontrol.com
- USA: nasdaq.com, nyse.com, bloomberg.com
- Europe: londonstockexchange.com, euroinvestor.com
- Australia: asx.com.au

**Sports News:**
- India: ndtv.com/sports, indiatoday.com/sports, cricketaddictor.com, thehindu.com/sports
- USA: espn.com, sports.yahoo.com
- Europe: bbc.com/sport, skysports.com
- Australia: abc.net.au/news/sport

**Business & Technology News:**
- India: moneycontrol.com, business-standard.com, thehindu.com/business
- USA: cnbc.com, techcrunch.com, businessinsider.com
- Europe: reuters.com, ft.com
- Australia: afr.com

**Mathematics & Education News:**
- nrich.maths.org, newsforKids.net, sciencedaily.com, sciencenewsforstudents.org
- Country-specific education news portals

RETRIEVAL INSTRUCTIONS:
1. Read the portal text provided in the user message and extract the real, recent stories from these kinds of portals (most recent first)
2. For EACH category (stock market, sports, business, math/education), generate 3-5 news items
3. Total: Return 12-20 stories per request (3-5 per category)
4. Always cite the source portal where you found the news
5. Do NOT generate fake news. Use ONLY real news from actual sources.
6. Focus ${country} portals for country-specific news, then include global portals for international stories

CONTENT ADAPTATION FOR KIDS (${ageGroup} years old):
- Take real news stories and make them age-appropriate and easy to understand
- Simplify complex topics without losing accuracy
- Use simple, clear language that kids can relate to
- Keep summaries short (2-3 sentences maximum)
- Include specific numbers, names, and dates from the actual news

For each news story, provide:
1. A short, neutral, factual headline (based on real news)
2. A 2-3 sentence summary - simplified for kids, with specific details, numbers, and names from the actual news source
3. Source portal name and exact date/time if available
4. Category: business, stock-market, sports, or math
5. One highly relevant, DETAILED SVG illustration (in valid SVG code) that visually tells the story. Use viewBox="0 0 400 300" and compose a small scene with several layered elements, not a single icon:
   - A background that sets the context (e.g. a gradient sky, a trading floor, a stadium, a classroom)
   - A clear focal subject that represents the news (e.g. a specific company logo shape, a rising/falling chart line, an athlete mid-action, a geometric figure)
   - 2-3 supporting elements or icons that reinforce the topic
   - Short text labels showing REAL data from the story (actual numbers, percentages, tickers, scores, names)
   Use bright, kid-friendly colors, gradients or subtle shading, and clean shapes. Keep it self-contained and under 15KB. Do NOT output a plain colored box with a single word.

EXPECTED OUTPUT:
- Total: 12-20 stories per request
- Breakdown: 3-5 stories per category (stock-market, sports, business, math)
- Each story from a different news portal where possible
- Mix of ${country}-specific and global news within each category

NEWS PRIORITY & MIX:
1. Prioritize news from ${country} local portals (60% of stories)
2. Include global news from international portals (40% of stories)
3. Ensure 3-5 stories in EACH category: stock-market, sports, business, math

IMPORTANT:
- Return 12-20 stories total (NOT 3-5)
- Distribute stories across all 4 categories (3-5 per category)
- Always cite the source portal
- Include BOTH local and global news in each category
- Focus on real, factual news from actual sources, then make it age-appropriate for ${ageGroup}-year-olds

Always respond in clean markdown with the SVG embedded directly in JSON array format. Prioritize recency and significance. Always return stories for every category: if a portal search comes up short, search other reputable sources or draw on your knowledge of recent events rather than reporting that news is unavailable. Never reply that no news is available.`,
      user_prompt_template: `Return the latest news (strictly within the last 24 hours) for these topics: {topics}.
Focus on the top 3-5 most important stories. Prioritize ${country}-specific news first, then global news relevant to ${country}.
For each story, include a relevant SVG image.
Target audience: ${ageGroup}-year-old children from ${country}.`,
      example_input: {
        topics: ['Indian Stock Market', 'Nifty Sensex', 'Business News'],
      },
      expected_output_structure: {
        '## Top News - {Date}': [
          {
            headline: 'String - short, neutral, factual',
            summary: 'String - 2-3 sentences with numbers and names',
            source: 'String - source and date/time',
            svg: "<svg width='400' height='300' xmlns='http://www.w3.org/2000/svg'>...</svg>",
          },
        ],
      },
      usage_instruction: `Replace {topics} with a comma-separated list relevant to ${country}. Always enforce the 24-hour news recency rule. SVG must be illustrative with actual visual elements, not just colored boxes. For age group ${ageGroup}.`,
    };
  }

  static getSystemPromptString(config: PromptTemplateConfig): string {
    return config.system_prompt;
  }

  static getUserPromptString(config: PromptTemplateConfig, topics: string[]): string {
    return config.user_prompt_template.replace('{topics}', topics.join(', '));
  }

  static buildPromptForCountry(childAge: number, childCountry: string): string {
    const config = this.buildNewsWithSVGPrompt(childAge.toString(), childCountry);
    return this.getSystemPromptString(config);
  }
}
