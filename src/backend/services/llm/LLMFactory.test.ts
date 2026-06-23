import { describe, it, expect } from 'vitest';
import { LLMFactory } from './LLMFactory';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { CohereProvider } from './providers/CohereProvider';
import { XAIProvider } from './providers/XAIProvider';
import { GeminiProvider } from './providers/GeminiProvider';

describe('LLMFactory', () => {
  it('should create OpenAI provider', () => {
    const provider = LLMFactory.createProvider('openai', 'test-key');
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it('should create Anthropic provider', () => {
    const provider = LLMFactory.createProvider('anthropic', 'test-key');
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  it('should create Cohere provider', () => {
    const provider = LLMFactory.createProvider('cohere', 'test-key');
    expect(provider).toBeInstanceOf(CohereProvider);
  });

  it('should create xAI provider', () => {
    const provider = LLMFactory.createProvider('xai', 'test-key');
    expect(provider).toBeInstanceOf(XAIProvider);
  });

  it('should create Gemini provider', () => {
    const provider = LLMFactory.createProvider('gemini', 'test-key');
    expect(provider).toBeInstanceOf(GeminiProvider);
  });

  it('should throw error for unsupported provider', () => {
    expect(() => LLMFactory.createProvider('unsupported' as any, 'test-key')).toThrow(
      'Unsupported LLM provider: unsupported'
    );
  });

  it('should return list of supported providers', () => {
    const providers = LLMFactory.getSupportedProviders();
    expect(providers).toEqual(['openai', 'anthropic', 'cohere', 'xai', 'gemini']);
  });

  it('should be case insensitive', () => {
    const provider1 = LLMFactory.createProvider('openai', 'test-key');
    const provider2 = LLMFactory.createProvider('OPENAI' as any, 'test-key');
    expect(provider1).toBeInstanceOf(OpenAIProvider);
    expect(provider2).toBeInstanceOf(OpenAIProvider);
  });
});
