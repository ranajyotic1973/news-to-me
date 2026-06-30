import { ILLMProvider } from './llm/ILLMProvider';
import { PromptBuilder } from './llm/PromptBuilder';

export interface MeaningResponse {
  text: string;
  meaning: string;
  examples?: string[];
}

/**
 * Service for generating meanings of selected text using LLM.
 * Uses a specialized agent with context-aware prompting.
 */
export class MeaningService {
  private llmProvider: ILLMProvider;
  private modelId: string;

  constructor(llmProvider: ILLMProvider, modelId: string) {
    this.llmProvider = llmProvider;
    this.modelId = modelId;
  }

  async getMeaning(selectedText: string): Promise<MeaningResponse> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(selectedText);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    try {
      const result = await this.llmProvider.generateContent(this.modelId, {
        prompt: fullPrompt,
        maxTokens: 200,
        temperature: 0.3, // Lower temperature for more consistent explanations
      });

      return this.parseResponse(selectedText, result.content);
    } catch (error) {
      throw new Error(`Failed to get meaning: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildSystemPrompt(): string {
    return `You are a helpful educational assistant specialized in explaining words and phrases to students aged 10-16.

Your role is to provide:
1. Clear, simple definitions appropriate for the age group
2. Context about when and how the word is used
3. One simple example if applicable

Keep explanations concise (1-2 sentences max) and avoid jargon. Use everyday language.

Format your response as plain text, not markdown.`;
  }

  private buildUserPrompt(selectedText: string): string {
    return `What does "${selectedText}" mean? Explain it in simple terms for a 10-16 year old.`;
  }

  private parseResponse(selectedText: string, llmResponse: string): MeaningResponse {
    // Clean up the response
    const meaning = llmResponse.trim();

    return {
      text: selectedText,
      meaning,
    };
  }
}
