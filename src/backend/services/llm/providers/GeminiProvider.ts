import axios from 'axios';
import {
  ILLMProvider,
  LLMModel,
  LLMGenerationParams,
  LLMGenerationResult,
} from '../ILLMProvider';
import { PromptTemplate } from '../PromptTemplate';

export class GeminiProvider implements ILLMProvider {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Google Gemini API key is required');
    }
    this.apiKey = apiKey;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: 'test' }],
            },
          ],
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<LLMModel[]> {
    try {
      const response = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`
      );

      const models = response.data.models || [];

      return models
        .filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
        .map((model: any) => ({
          id: model.name.replace('models/', ''),
          name: model.displayName || model.baseModelId,
          inputCostPer1mTokens: this.getGeminiInputCost(model.baseModelId),
          outputCostPer1mTokens: this.getGeminiOutputCost(model.baseModelId),
        }));
    } catch (error) {
      console.error('Error fetching Gemini models:', error);
      return [];
    }
  }

  private getGeminiInputCost(modelId: string): number {
    const costs: { [key: string]: number } = {
      'gemini-2.0-flash': 0.1,
      'gemini-1.5-flash': 0.075,
      'gemini-1.5-pro': 1.25,
      'gemini-2.0-flash-exp': 0.1,
    };
    return costs[modelId] || 0.1;
  }

  private getGeminiOutputCost(modelId: string): number {
    const costs: { [key: string]: number } = {
      'gemini-2.0-flash': 0.4,
      'gemini-1.5-flash': 0.3,
      'gemini-1.5-pro': 5,
      'gemini-2.0-flash-exp': 0.4,
    };
    return costs[modelId] || 0.4;
  }

  async generateContent(
    modelId: string,
    params: LLMGenerationParams
  ): Promise<LLMGenerationResult> {
    const childAge = params.childAge?.toString() || '10-16';
    const childCountry = params.childCountry || 'Global';
    const systemPrompt = PromptTemplate.getSystemPromptString(
      PromptTemplate.buildNewsWithSVGPrompt(childAge, childCountry)
    );

    const response = await axios.post(
      `${this.baseUrl}/${modelId}:generateContent?key=${this.apiKey}`,
      {
        system: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            parts: [{ text: params.prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: params.maxTokens || 1024,
          temperature: params.temperature ?? 0.7,
          topP: params.topP ?? 1,
        },
      }
    );

    const completion = response.data.candidates[0].content.parts[0].text;
    const usageData = response.data.usageMetadata;
    const inputTokens = usageData.promptTokenCount;
    const outputTokens = usageData.candidatesTokenCount;

    const modelCosts = this.getModelCosts(modelId);
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

  private getModelCosts(modelId: string): { input: number; output: number } {
    const costs: { [key: string]: { input: number; output: number } } = {
      'gemini-1.5-flash': { input: 0.075, output: 0.3 },
      'gemini-1.5-pro': { input: 1.25, output: 5 },
      'gemini-2.0-flash': { input: 0.1, output: 0.4 },
    };

    return costs[modelId] || { input: 0.1, output: 0.4 };
  }
}
