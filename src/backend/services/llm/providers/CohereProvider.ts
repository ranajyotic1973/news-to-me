import axios from 'axios';
import {
  ILLMProvider,
  LLMModel,
  LLMGenerationParams,
  LLMGenerationResult,
} from '../ILLMProvider';

export class CohereProvider implements ILLMProvider {
  private apiKey: string;
  private baseUrl = 'https://api.cohere.ai/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Cohere API key is required');
    }
    this.apiKey = apiKey;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/generate`,
        {
          prompt: 'test',
          max_tokens: 10,
          num_generations: 1,
        },
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<LLMModel[]> {
    try {
      const response = await axios.get('https://api.cohere.com/v1/models', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      const models = response.data.models || [];

      return models.map((model: any) => ({
        id: model.name,
        name: model.name,
        inputCostPer1mTokens: this.getCohereInputCost(model.name),
        outputCostPer1mTokens: this.getCohereOutputCost(model.name),
      }));
    } catch (error) {
      console.error('Error fetching Cohere models:', error);
      return [];
    }
  }

  private getCohereInputCost(modelId: string): number {
    const costs: { [key: string]: number } = {
      'command-r-plus-08-2024': 3,
      'command-r-08-2024': 0.5,
      'command-r-plus': 3,
      'command-r': 0.5,
    };
    return costs[modelId] || 1;
  }

  private getCohereOutputCost(modelId: string): number {
    const costs: { [key: string]: number } = {
      'command-r-plus-08-2024': 15,
      'command-r-08-2024': 1.5,
      'command-r-plus': 15,
      'command-r': 1.5,
    };
    return costs[modelId] || 5;
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

Do NOT skip the SVGImage field. Do NOT use external image URLs. Every story MUST have an SVG graphic.

---

User Request:
${params.prompt}`;

    const response = await axios.post(
      `${this.baseUrl}/generate`,
      {
        model: modelId,
        prompt: systemPrompt,
        max_tokens: params.maxTokens || 500,
        temperature: params.temperature ?? 0.7,
        p: params.topP ?? 1,
      },
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      }
    );

    const completion = response.data.generations[0].text;
    const inputTokens = response.data.meta?.billed_units?.input_tokens || 0;
    const outputTokens = response.data.meta?.billed_units?.output_tokens || 0;

    const modelCosts = this.getCohereModelCosts(modelId);
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

  private getCohereModelCosts(modelId: string): { input: number; output: number } {
    const costs: { [key: string]: { input: number; output: number } } = {
      'command-r-plus-08-2024': { input: 3, output: 15 },
      'command-r-08-2024': { input: 0.5, output: 1.5 },
    };

    return costs[modelId] || { input: 1, output: 1 };
  }
}
