import {
  ILLMProvider,
  LLMModel,
  LLMGenerationParams,
  LLMGenerationResult,
} from '../ILLMProvider';

export class MockLLMProvider implements ILLMProvider {
  async validateApiKey(): Promise<boolean> {
    return true;
  }

  async listModels(): Promise<LLMModel[]> {
    return [
      {
        id: 'mock-fast',
        name: 'Mock Fast Model',
        inputCostPer1mTokens: 0,
        outputCostPer1mTokens: 0,
      },
      {
        id: 'mock-standard',
        name: 'Mock Standard Model',
        inputCostPer1mTokens: 0,
        outputCostPer1mTokens: 0,
      },
      {
        id: 'mock-quality',
        name: 'Mock Quality Model',
        inputCostPer1mTokens: 0,
        outputCostPer1mTokens: 0,
      },
    ];
  }

  async generateContent(
    _modelId: string,
    _params: LLMGenerationParams
  ): Promise<LLMGenerationResult> {
    // Generate diverse, detailed mock stories matching expected format
    const mockStories = `
- Headline: Apple Inc. Reports Q3 Revenue of $81.8 Billion, Up 5.2% Year-Over-Year
- Summary: Apple Inc. (AAPL) announced record-breaking quarterly earnings with total revenue reaching $81.8 billion, surpassing analyst expectations by $2.3 billion. iPhone sales drove 42% of revenue ($34.4B), while Services segment grew 16% to $22.3B. Operating margin improved to 31.4%. Stock price surged 4.7% to $189.45 in after-hours trading.
- Category: business

- Headline: S&P 500 Index Breaks 5,400 Barrier, Up 18.3% This Year
- Summary: The S&P 500 index climbed to a new all-time high of 5,412 points, driven by strong corporate earnings and investor optimism about economic growth. Technology stocks led the gains with a 2.1% jump, while the Financial sector gained 1.8%. The index has gained 18.3% year-to-date, with mega-cap stocks contributing 35% of gains. Volatility index (VIX) fell to 14.2.
- Category: stock-market

- Headline: Young Mathematicians from 112 Countries Compete at International Math Olympiad Finals
- Summary: The 65th International Mathematical Olympiad concluded with stunning problem-solving performances. 607 competitors solved complex geometry, number theory, and combinatorics problems. China's team scored 227 points (out of 252), followed by Russia with 204 and USA with 201. The most challenging problem (Problem 6) was solved by only 3 contestants worldwide. Winners received gold, silver, and bronze medals.
- Category: math

- Headline: The Lost Kingdom of Crystal Caverns - A Young Explorer's Adventure
- Summary: Join 12-year-old Maya as she discovers a hidden map in her grandmother's attic that leads to the legendary Crystal Caverns beneath the mountains. Armed with only a flashlight and her wits, Maya must solve ancient puzzles and outwit the mischievous Guardian of Crystals to find the legendary Blue Prism. Along the way, she makes friends with luminescent creatures and uncovers secrets about her family's past. Will she escape the caverns before midnight?
- Category: sports
`;

    return {
      content: mockStories,
      inputTokens: 300,
      outputTokens: 600,
      totalCost: 0,
    };
  }
}
