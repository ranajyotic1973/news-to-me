import axios from 'axios';
import {
  ILLMProvider,
  LLMModel,
  LLMGenerationParams,
  LLMGenerationResult,
} from '../ILLMProvider';

export class OpenAIProvider implements ILLMProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.apiKey = apiKey;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<LLMModel[]> {
    const response = await axios.get(`${this.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    const models = response.data.data || [];
    const chatModels = models.filter((m: any) => m.id.includes('gpt'));

    return chatModels.map((m: any) => ({
      id: m.id,
      name: m.id,
      inputCostPer1mTokens: this.getOpenAIInputCost(m.id),
      outputCostPer1mTokens: this.getOpenAIOutputCost(m.id),
    }));
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
      `${this.baseUrl}/chat/completions`,
      {
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: params.prompt }
        ],
        max_tokens: params.maxTokens || 500,
        temperature: params.temperature ?? 0.7,
        top_p: params.topP ?? 1,
      },
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      }
    );

    const completion = response.data.choices[0].message.content;
    const inputTokens = response.data.usage.prompt_tokens;
    const outputTokens = response.data.usage.completion_tokens;

    const inputCost = (inputTokens / 1000000) * this.getOpenAIInputCost(modelId);
    const outputCost = (outputTokens / 1000000) * this.getOpenAIOutputCost(modelId);
    const totalCost = inputCost + outputCost;

    return {
      content: completion,
      inputTokens,
      outputTokens,
      totalCost,
    };
  }

  private getOpenAIInputCost(modelId: string): number {
    const costs: { [key: string]: number } = {
      'gpt-4o': 5,
      'gpt-4-turbo': 10,
      'gpt-4': 30,
      'gpt-3.5-turbo': 0.5,
    };

    for (const [model, cost] of Object.entries(costs)) {
      if (modelId.includes(model)) return cost;
    }

    return 1;
  }

  private getOpenAIOutputCost(modelId: string): number {
    const costs: { [key: string]: number } = {
      'gpt-4o': 15,
      'gpt-4-turbo': 30,
      'gpt-4': 60,
      'gpt-3.5-turbo': 1.5,
    };

    for (const [model, cost] of Object.entries(costs)) {
      if (modelId.includes(model)) return cost;
    }

    return 2;
  }
}
