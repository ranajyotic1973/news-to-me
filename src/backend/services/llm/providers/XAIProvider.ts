import axios from 'axios';
import {
  ILLMProvider,
  LLMModel,
  LLMGenerationParams,
  LLMGenerationResult,
} from '../ILLMProvider';

export class XAIProvider implements ILLMProvider {
  private apiKey: string;
  private baseUrl = 'https://api.x.ai/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('xAI API key is required');
    }
    this.apiKey = apiKey;
  }

  async validateApiKey(): Promise<boolean> {
    // xAI API validation - check if token has valid format
    // Format: xai-<alphanumeric>
    if (this.apiKey && this.apiKey.startsWith('xai-') && this.apiKey.length > 10) {
      return true;
    }
    return false;
  }

  async listModels(): Promise<LLMModel[]> {
    try {
      // Note: xAI does not expose a public models list API endpoint
      // Models are sourced from xAI documentation at https://docs.x.ai/developers/models
      const models: LLMModel[] = [
        {
          id: 'grok-4.3',
          name: 'Grok 4.3 (Flagship, 1M context)',
          inputCostPer1mTokens: 1.25,
          outputCostPer1mTokens: 2.5,
        },
        {
          id: 'grok-4.20-0309-reasoning',
          name: 'Grok 4.20 Reasoning (Extended Thinking, 1M context)',
          inputCostPer1mTokens: 1.25,
          outputCostPer1mTokens: 2.5,
        },
        {
          id: 'grok-4.20-0309-non-reasoning',
          name: 'Grok 4.20 Non-Reasoning (Fast, 232 tokens/sec, 1M context)',
          inputCostPer1mTokens: 1.25,
          outputCostPer1mTokens: 2.5,
        },
        {
          id: 'grok-4.20-multi-agent-0309',
          name: 'Grok 4.20 Multi-Agent (Parallel Research, 1M context)',
          inputCostPer1mTokens: 1.25,
          outputCostPer1mTokens: 2.5,
        },
        {
          id: 'grok-build-0.1',
          name: 'Grok Build 0.1 (Coding, 256K context)',
          inputCostPer1mTokens: 1.0,
          outputCostPer1mTokens: 2.0,
        },
      ];

      return models;
    } catch (error) {
      console.error('Error in xAI listModels:', error);
      return [];
    }
  }

  async generateContent(
    modelId: string,
    params: LLMGenerationParams
  ): Promise<LLMGenerationResult> {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: modelId || 'grok-3',
        messages: [{ role: 'user', content: params.prompt }],
        max_tokens: params.maxTokens || 1024,
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

    const inputCost = (inputTokens / 1000000) * 5;
    const outputCost = (outputTokens / 1000000) * 15;
    const totalCost = inputCost + outputCost;

    return {
      content: completion,
      inputTokens,
      outputTokens,
      totalCost,
    };
  }
}
