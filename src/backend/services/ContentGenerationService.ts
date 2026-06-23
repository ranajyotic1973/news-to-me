import { ILLMProvider } from './llm/ILLMProvider';
import { PromptBuilder, PromptContext } from './llm/PromptBuilder';
import { StoryFormattingService, NewspaperPage } from './StoryFormattingService';

export interface ContentGenerationOptions {
  storiesPerPage?: number;
  childAge: number;
  childCountry: string;
  stockMarketIndex?: string;
  currency?: string;
}

export class ContentGenerationService {
  constructor(
    private llmProvider: ILLMProvider,
    private llmModelId: string
  ) {}

  async generateNewspaperContent(options: ContentGenerationOptions): Promise<NewspaperPage[]> {
    const storiesPerPage = options.storiesPerPage || 4;

    try {
      // Build context for LLM
      const promptContext: PromptContext = {
        childAge: options.childAge,
        childCountry: options.childCountry,
        stockMarketIndex: options.stockMarketIndex,
        currency: options.currency,
      };

      // Generate content directly from LLM (no news source needed)
      const prompt = PromptBuilder.buildLLMNewsGenerationPrompt(promptContext);

      const generationResult = await this.llmProvider.generateContent(this.llmModelId, {
        prompt,
        maxTokens: 2500,
        temperature: 0.8,
      });

      // Parse and format stories
      const stories = StoryFormattingService.parseGeneratedContent(generationResult.content);

      if (!StoryFormattingService.validateStories(stories)) {
        throw new Error('Generated stories failed validation');
      }

      // Create pages
      const pages = StoryFormattingService.createPages(stories, storiesPerPage);

      return pages;
    } catch (error) {
      console.error('Error generating newspaper content:', error);
      throw error;
    }
  }
}
