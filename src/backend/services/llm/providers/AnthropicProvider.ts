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
    const response = await axios.post(
      `${this.baseUrl}/messages`,
      {
        model: modelId,
        max_tokens: params.maxTokens || 1024,
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
