import axios from 'axios';
import {
  ILLMProvider,
  LLMModel,
  LLMGenerationParams,
  LLMGenerationResult,
} from '../ILLMProvider';

export class AnthropicProvider implements ILLMProvider {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.apiKey = apiKey;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<LLMModel[]> {
    try {
      const response = await axios.get('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
      });

      const models = response.data.data || [];

      return models.map((model: any) => ({
        id: model.id,
        name: model.display_name || model.id,
        inputCostPer1mTokens: this.getAnthropicInputCost(model.id),
        outputCostPer1mTokens: this.getAnthropicOutputCost(model.id),
      }));
    } catch (error) {
      console.error('Error fetching Anthropic models:', error);
      return [];
    }
  }

  private getAnthropicInputCost(modelId: string): number {
    const costs: { [key: string]: number } = {
      'claude-opus-4-6': 15,
      'claude-opus-4-8': 15,
      'claude-3-5-sonnet-20241022': 3,
      'claude-3-haiku-20250307': 0.8,
    };
    return costs[modelId] || 3;
  }

  private getAnthropicOutputCost(modelId: string): number {
    const costs: { [key: string]: number } = {
      'claude-opus-4-6': 75,
      'claude-opus-4-8': 75,
      'claude-3-5-sonnet-20241022': 15,
      'claude-3-haiku-20250307': 4,
    };
    return costs[modelId] || 15;
  }

  async generateContent(
    modelId: string,
    params: LLMGenerationParams
  ): Promise<LLMGenerationResult> {
    const systemPrompt = `You are a news article generator for children aged 10-16.

CRITICAL: For each story you generate, you MUST include ALL of these fields in EXACTLY this format:
- Headline: [story headline]
- Summary: [2-3 sentences]
- Category: [business|stock-market|sports|math]
- SVGImage: [simple SVG graphic representing the story]

The SVGImage field is REQUIRED. Generate a simple, clear SVG graphic (200x200px viewBox) that visually represents the story topic.

SVG Examples:
Business story: <svg viewBox="0 0 200 200"><rect x="20" y="50" width="30" height="100" fill="#4CAF50"/><rect x="60" y="30" width="30" height="120" fill="#2196F3"/><rect x="100" y="70" width="30" height="80" fill="#FF9800"/><text x="50" y="180" font-size="12" text-anchor="middle">Growth Chart</text></svg>

Sports story: <svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="60" fill="none" stroke="#F44336" stroke-width="3"/><circle cx="80" cy="80" r="8" fill="#F44336"/><circle cx="120" cy="120" r="8" fill="#F44336"/><text x="100" y="180" font-size="12" text-anchor="middle">Cricket Match</text></svg>

Do NOT skip the SVGImage field. Do NOT use external image URLs. Every story MUST have an SVG graphic.`;

    const response = await axios.post(
      `${this.baseUrl}/messages`,
      {
        model: modelId,
        max_tokens: params.maxTokens || 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: params.prompt }],
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    const completion = response.data.content[0].text;
    const inputTokens = response.data.usage.input_tokens;
    const outputTokens = response.data.usage.output_tokens;

    const modelCosts = this.getAnthropicCosts(modelId);
    const inputCost = (inputTokens / 1000000) * modelCosts.input;
    const outputCost = (outputTokens / 1000000) * modelCosts.output;
    const totalCost = inputCost + outputCost;

    return {
      content: completion,
      inputTokens,
      outputTokens,
      totalCost,
    };
  }

  private getAnthropicCosts(
    modelId: string
  ): { input: number; output: number } {
    const costs: { [key: string]: { input: number; output: number } } = {
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-3-opus-20250219': { input: 15, output: 75 },
      'claude-3-haiku-20250307': { input: 0.8, output: 4 },
    };

    return costs[modelId] || { input: 1, output: 1 };
  }
}
