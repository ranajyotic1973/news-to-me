import { ILLMProvider } from './llm/ILLMProvider';
import { PromptBuilder, PromptContext } from './llm/PromptBuilder';
import { StoryFormattingService, NewspaperPage } from './StoryFormattingService';
import { NewspaperCacheService } from './NewspaperCacheService';
import { NewsPortalFetchService } from './news/NewsPortalFetchService';

export interface ContentGenerationOptions {
  storiesPerPage?: number;
  childAge: number;
  childCountry: string;
  stockMarketIndex?: string;
  currency?: string;
  pageNum?: number;
}

export class ContentGenerationService {
  // Shared across instances (one instance is created per request) so that two
  // near-simultaneous requests for the same page reuse a single generation
  // instead of both making a full LLM call.
  private static inFlight: Map<string, Promise<NewspaperPage>> = new Map();

  private portalFetchService = new NewsPortalFetchService();

  constructor(
    private llmProvider: ILLMProvider,
    private llmModelId: string
  ) {}

  async generateNewspaperContent(options: ContentGenerationOptions): Promise<NewspaperPage> {
    const pageNum = options.pageNum || 1;

    // Check cache first
    const cachedPage = NewspaperCacheService.getCachedPage(
      options.childAge,
      options.childCountry,
      pageNum
    );
    if (cachedPage) {
      console.log(`[ContentGenerationService] Cache hit for page ${pageNum}`);
      return cachedPage;
    }

    // De-duplicate concurrent generations of the same page.
    const key = `${options.childAge}:${options.childCountry}:${pageNum}`;
    const existing = ContentGenerationService.inFlight.get(key);
    if (existing) {
      console.log(`[ContentGenerationService] Reusing in-flight generation for page ${pageNum}`);
      return existing;
    }

    const promise = this.doGenerate(options, pageNum).finally(() => {
      ContentGenerationService.inFlight.delete(key);
    });
    ContentGenerationService.inFlight.set(key, promise);
    return promise;
  }

  private async doGenerate(
    options: ContentGenerationOptions,
    pageNum: number
  ): Promise<NewspaperPage> {
    const storiesPerPage = options.storiesPerPage || 4;

    try {
      console.log(`[ContentGenerationService] Cache miss for page ${pageNum}, generating...`);

      // Build context for LLM
      const promptContext: PromptContext = {
        childAge: options.childAge,
        childCountry: options.childCountry,
        stockMarketIndex: options.stockMarketIndex,
        currency: options.currency,
      };

      // Fetch real content from known news portals for this country/page.
      // Failures are tolerated (returns fewer/no portals) and the prompt falls
      // back to the model's own knowledge so generation never hard-fails.
      const portals = await this.portalFetchService.fetchPortalContent(
        options.childCountry,
        pageNum
      );
      console.log(
        `[ContentGenerationService] Fetched ${portals.length} portal(s) for ${options.childCountry} page ${pageNum}: ${portals
          .map((p) => p.name)
          .join(', ')}`
      );

      // Build a prompt that turns the fetched portal content into stories.
      const prompt = PromptBuilder.buildNewsFromPortalContentPrompt(
        promptContext,
        portals,
        pageNum
      );

      const generationResult = await this.llmProvider.generateContent(this.llmModelId, {
        prompt,
        maxTokens: 8000,
        temperature: 0.8,
        childAge: options.childAge,
        childCountry: options.childCountry,
      });

      // Log raw LLM response to stdout
      console.log('\n\n========== RAW LLM RESPONSE ==========');
      console.log(generationResult.content);
      console.log('========== END RAW LLM RESPONSE ==========\n\n');

      // Parse and format stories
      const stories = StoryFormattingService.parseGeneratedContent(generationResult.content);

      if (!StoryFormattingService.validateStories(stories)) {
        throw new Error('Generated stories failed validation');
      }

      // Create a single page from generated stories (each page is a new batch of 4 stories)
      const page: NewspaperPage = {
        pageNumber: pageNum,
        totalPages: pageNum, // Initially, totalPages = current page (will grow as user requests more pages)
        stories: stories.slice(0, storiesPerPage),
      };

      // Cache this page
      NewspaperCacheService.cachePage(options.childAge, options.childCountry, page);

      // Get the highest page number ever generated for this session
      const lastGeneratedPageNum = NewspaperCacheService.getLastGeneratedPageNum(
        options.childAge,
        options.childCountry
      );

      // Update totalPages to reflect all generated pages so far
      page.totalPages = lastGeneratedPageNum;

      return page;
    } catch (error) {
      console.error('Error generating newspaper content:', error);
      throw error;
    }
  }
}
