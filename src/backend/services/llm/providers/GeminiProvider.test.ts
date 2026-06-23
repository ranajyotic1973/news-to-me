import { describe, it, expect } from 'vitest';
import { GeminiProvider } from './GeminiProvider';

describe('GeminiProvider', () => {
  it('should require API key', () => {
    expect(() => new GeminiProvider('')).toThrow('Google Gemini API key is required');
  });

  it('should be instantiable with valid API key', () => {
    const provider = new GeminiProvider('test-key');
    expect(provider).toBeDefined();
  });

  it('should have listModels method', async () => {
    const provider = new GeminiProvider('test-key');
    const models = await provider.listModels();
    expect(models).toBeDefined();
    expect(models.length).toBeGreaterThan(0);
  });

  it('should include Gemini 1.5 Flash (cheapest)', async () => {
    const provider = new GeminiProvider('test-key');
    const models = await provider.listModels();
    const flash = models.find((m) => m.id === 'gemini-1.5-flash');
    expect(flash).toBeDefined();
    expect(flash?.inputCostPer1mTokens).toBe(0.075);
    expect(flash?.outputCostPer1mTokens).toBe(0.3);
  });

  it('should include Gemini 1.5 Pro', async () => {
    const provider = new GeminiProvider('test-key');
    const models = await provider.listModels();
    const pro = models.find((m) => m.id === 'gemini-1.5-pro');
    expect(pro).toBeDefined();
  });

  it('should include Gemini 2.0 Flash', async () => {
    const provider = new GeminiProvider('test-key');
    const models = await provider.listModels();
    const flash2 = models.find((m) => m.id === 'gemini-2.0-flash');
    expect(flash2).toBeDefined();
  });
});
