import axios from 'axios';
import {
  ILLMProvider,
  LLMModel,
  LLMGenerationParams,
  LLMGenerationResult,
} from '../ILLMProvider';

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
