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
    const response = await axios.post(
      `${this.baseUrl}/generate`,
      {
        model: modelId,
        prompt: params.prompt,
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
