export interface LLMModel {
  id: string;
  name: string;
  inputCostPer1mTokens: number;
  outputCostPer1mTokens: number;
}

export interface LLMGenerationParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  childAge?: number;
  childCountry?: string;
}

export interface LLMGenerationResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

export interface ILLMProvider {
  listModels(): Promise<LLMModel[]>;
  generateContent(
    modelId: string,
    params: LLMGenerationParams
  ): Promise<LLMGenerationResult>;
  validateApiKey(): Promise<boolean>;
}
