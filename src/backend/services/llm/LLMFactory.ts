import { ILLMProvider } from './ILLMProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { CohereProvider } from './providers/CohereProvider';
import { XAIProvider } from './providers/XAIProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { MockLLMProvider } from './providers/MockLLMProvider';

export type SupportedProvider = 'openai' | 'anthropic' | 'cohere' | 'xai' | 'gemini' | 'mock';

export class LLMFactory {
  static createProvider(provider: SupportedProvider, apiKey: string): ILLMProvider {
    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(apiKey);
      case 'anthropic':
        return new AnthropicProvider(apiKey);
      case 'cohere':
        return new CohereProvider(apiKey);
      case 'xai':
        return new XAIProvider(apiKey);
      case 'gemini':
        return new GeminiProvider(apiKey);
      case 'mock':
        return new MockLLMProvider();
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  static getSupportedProviders(): SupportedProvider[] {
    return ['mock', 'openai', 'anthropic', 'cohere', 'xai', 'gemini'];
  }
}
