import { LLMFactory } from './llm/LLMFactory';
import { ModelSelector } from './llm/ModelSelector';
import { LLMModel } from './llm/ILLMProvider';

export class ConfigurationService {
  static async validateAndListModels(
    provider: string,
    apiToken: string
  ): Promise<{ valid: boolean; models?: LLMModel[]; error?: string }> {
    try {
      const llmProvider = LLMFactory.createProvider(provider as any, apiToken);

      const isValid = await llmProvider.validateApiKey();
      if (!isValid) {
        return { valid: false, error: 'Invalid API token or provider' };
      }

      const models = await llmProvider.listModels();
      return { valid: true, models };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { valid: false, error: errorMessage };
    }
  }

  static selectMostEconomicalModel(models: LLMModel[]): LLMModel {
    return ModelSelector.selectCheapestModel(models);
  }

  static getSupportedProviders(): string[] {
    return LLMFactory.getSupportedProviders();
  }
}
