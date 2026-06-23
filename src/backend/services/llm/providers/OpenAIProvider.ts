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
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: modelId,
        messages: [{ role: 'user', content: params.prompt }],
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
