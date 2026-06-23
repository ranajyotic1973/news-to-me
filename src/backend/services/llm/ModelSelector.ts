import { LLMModel } from './ILLMProvider';

export class ModelSelector {
  static selectCheapestModel(models: LLMModel[]): LLMModel {
    if (models.length === 0) {
      throw new Error('No models available');
    }

    return models.reduce((cheapest, current) => {
      const cheapestCost = cheapest.inputCostPer1mTokens + cheapest.outputCostPer1mTokens;
      const currentCost = current.inputCostPer1mTokens + current.outputCostPer1mTokens;

      return currentCost < cheapestCost ? current : cheapest;
    });
  }

  static estimateCost(
    model: LLMModel,
    estimatedInputTokens: number,
    estimatedOutputTokens: number
  ): number {
    const inputCost = (estimatedInputTokens / 1000000) * model.inputCostPer1mTokens;
    const outputCost = (estimatedOutputTokens / 1000000) * model.outputCostPer1mTokens;
    return inputCost + outputCost;
  }

  static sortByPrice(models: LLMModel[]): LLMModel[] {
    return [...models].sort((a, b) => {
      const aCost = a.inputCostPer1mTokens + a.outputCostPer1mTokens;
      const bCost = b.inputCostPer1mTokens + b.outputCostPer1mTokens;
      return aCost - bCost;
    });
  }
}
