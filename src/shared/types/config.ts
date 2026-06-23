export interface ChildProfile {
  name: string;
  age: number;
  country: string;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'cohere' | 'xai' | 'gemini' | 'mock';
  apiToken: string;
  selectedModel: string;
}

export interface AppConfiguration {
  childProfile: ChildProfile;
  llmConfig: LLMConfig;
  createdAt: number;
  updatedAt: number;
}

export const SUPPORTED_LLM_PROVIDERS = ['mock', 'openai', 'anthropic', 'cohere', 'xai', 'gemini'] as const;
export const MIN_CHILD_AGE = 10;
export const MAX_CHILD_AGE = 16;

export function isValidAge(age: number): boolean {
  return Number.isInteger(age) && age >= MIN_CHILD_AGE && age <= MAX_CHILD_AGE;
}

export function isValidName(name: string): boolean {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 100;
}

export function isValidCountry(country: string): boolean {
  return typeof country === 'string' && country.trim().length > 0;
}
