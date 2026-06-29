import { ipcMain } from 'electron';
import { logger } from './logger';
import { ContentGenerationService } from '../backend/services/ContentGenerationService';
import { LLMFactory, SupportedProvider } from '../backend/services/llm/LLMFactory';
import { NewspaperPage } from '../backend/services/StoryFormattingService';

// Initialize handlers
export function setupIpcHandlers(): void {
  logger.info('Initializing IPC handlers...');

  // Health check
  ipcMain.handle('health:check', async () => {
    logger.trace('IPC: health:check called');
    const result = { status: 'ok', timestamp: new Date().toISOString() };
    logger.debug('IPC: health:check result', result);
    return result;
  });

  // Config: Validate Token
  ipcMain.handle('config:validateToken', async (_event, provider: string, apiToken: string) => {
    logger.trace('IPC: config:validateToken called', { provider, hasToken: !!apiToken });
    try {
      logger.info(`Validating token for provider: ${provider}`);
      const llmProvider = LLMFactory.createProvider(provider as SupportedProvider, apiToken);
      const models = await llmProvider.listModels();

      const result = {
        valid: true,
        models: models.map((model) => ({
          id: model.id,
          name: model.name,
          inputCostPer1mTokens: model.inputCostPer1mTokens,
          outputCostPer1mTokens: model.outputCostPer1mTokens,
        })),
      };
      logger.debug('Token validation successful', { provider, modelCount: models.length });
      return result;
    } catch (error) {
      logger.error('Token validation failed:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  });

  // Config: List Models
  ipcMain.handle('config:listModels', async (_event, provider: string, apiToken: string) => {
    try {
      logger.info(`Listing models for provider: ${provider}`);
      const llmProvider = LLMFactory.createProvider(provider as SupportedProvider, apiToken);
      const models = await llmProvider.listModels();

      const recommended = models[0];
      return {
        models: models.map((model) => ({
          id: model.id,
          name: model.name,
          inputCostPer1mTokens: model.inputCostPer1mTokens,
          outputCostPer1mTokens: model.outputCostPer1mTokens,
        })),
        recommended: {
          id: recommended.id,
          inputCostPer1mTokens: recommended.inputCostPer1mTokens,
          outputCostPer1mTokens: recommended.outputCostPer1mTokens,
        },
      };
    } catch (error) {
      logger.error('List models failed:', error);
      throw error;
    }
  });

  // Config: Get Providers
  ipcMain.handle('config:getProviders', async () => {
    try {
      logger.info('Getting available LLM providers');
      const providers = ['openai', 'anthropic', 'google', 'xai', 'cohere'];
      return { providers };
    } catch (error) {
      logger.error('Get providers failed:', error);
      throw error;
    }
  });

  // Newspaper: Get Page
  ipcMain.handle(
    'newspaper:getPage',
    async (
      _event,
      pageNum: number,
      childAge: number,
      childCountry: string,
      provider: string,
      apiToken: string,
      modelId: string
    ): Promise<NewspaperPage> => {
      logger.trace('IPC: newspaper:getPage called', { pageNum, childAge, childCountry, provider, modelId });
      try {
        logger.info(`Generating newspaper page ${pageNum} for ${childCountry}`);

        const llmProvider = LLMFactory.createProvider(provider as SupportedProvider, apiToken);
        const contentService = new ContentGenerationService(llmProvider, modelId);

        logger.debug('Starting content generation', { childAge, childCountry, storiesPerPage: 4 });
        const pages = await contentService.generateNewspaperContent({
          childAge,
          childCountry,
          storiesPerPage: 4,
        });

        if (pageNum > pages.length || pageNum < 1) {
          throw new Error(`Page ${pageNum} out of range`);
        }

        logger.debug('Page generated successfully', { pageNum, totalPages: pages.length, storyCount: pages[pageNum - 1].stories.length });
        return pages[pageNum - 1];
      } catch (error) {
        logger.error('Generate page failed:', error);
        throw error;
      }
    }
  );

  // Newspaper: Regenerate Content
  ipcMain.handle(
    'newspaper:regenerateContent',
    async (
      _event,
      childCountry: string,
      provider: string,
      apiToken: string,
      modelId: string
    ) => {
      try {
        logger.info(`Regenerating content for ${childCountry}`);

        const llmProvider = LLMFactory.createProvider(provider as SupportedProvider, apiToken);
        const contentService = new ContentGenerationService(llmProvider, modelId);

        await contentService.generateNewspaperContent({
          childAge: 13,
          childCountry,
          storiesPerPage: 4,
        });

        return { success: true, message: 'Content regenerated successfully' };
      } catch (error) {
        logger.error('Regenerate content failed:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}
