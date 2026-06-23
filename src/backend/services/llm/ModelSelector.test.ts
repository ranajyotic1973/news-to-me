import { describe, it, expect } from 'vitest';
import { ModelSelector } from './ModelSelector';
import { LLMModel } from './ILLMProvider';

describe('ModelSelector', () => {
  const testModels: LLMModel[] = [
    {
      id: 'model-1',
      name: 'Model 1',
      inputCostPer1mTokens: 10,
      outputCostPer1mTokens: 20,
    },
    {
      id: 'model-2',
      name: 'Model 2',
      inputCostPer1mTokens: 5,
      outputCostPer1mTokens: 10,
    },
    {
      id: 'model-3',
      name: 'Model 3',
      inputCostPer1mTokens: 3,
      outputCostPer1mTokens: 8,
    },
  ];

  it('should select the cheapest model', () => {
    const cheapest = ModelSelector.selectCheapestModel(testModels);
    expect(cheapest.id).toBe('model-3');
  });

  it('should throw error when no models available', () => {
    expect(() => ModelSelector.selectCheapestModel([])).toThrow('No models available');
  });

  it('should estimate cost correctly', () => {
    const model = testModels[0];
    const cost = ModelSelector.estimateCost(model, 1000000, 500000);
    const expectedCost = 10 + 10; // 1M input tokens @ 10 + 0.5M output tokens @ 20
    expect(cost).toBe(expectedCost);
  });

  it('should sort models by price', () => {
    const sorted = ModelSelector.sortByPrice(testModels);
    expect(sorted[0].id).toBe('model-3');
    expect(sorted[1].id).toBe('model-2');
    expect(sorted[2].id).toBe('model-1');
  });

  it('should not mutate original array when sorting', () => {
    const original = [...testModels];
    ModelSelector.sortByPrice(testModels);
    expect(testModels).toEqual(original);
  });
});
