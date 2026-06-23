import { describe, it, expect } from 'vitest';
import { XAIProvider } from './XAIProvider';

describe('XAIProvider', () => {
  it('should require API key', () => {
    expect(() => new XAIProvider('')).toThrow('xAI API key is required');
  });

  it('should be instantiable with valid API key', () => {
    const provider = new XAIProvider('test-key');
    expect(provider).toBeDefined();
  });

  it('should have listModels method', async () => {
    const provider = new XAIProvider('test-key');
    const models = await provider.listModels();
    expect(models).toBeDefined();
    expect(models.length).toBeGreaterThan(0);
    expect(models[0].id).toBe('grok-3');
  });

  it('should have pricing information', async () => {
    const provider = new XAIProvider('test-key');
    const models = await provider.listModels();
    expect(models[0].inputCostPer1mTokens).toBe(5);
    expect(models[0].outputCostPer1mTokens).toBe(15);
  });
});
