import { Router, Request, Response } from 'express';
import { ContentGenerationService } from '../services/ContentGenerationService';
import { LLMFactory } from '../services/llm/LLMFactory';
import { StockMarketLocalization } from '../services/StockMarketLocalization';
import { newspaperPageCache } from '../utils/cache';

const router = Router();

interface CachedContent {
  pages: any[];
  timestamp: number;
  childAge: number;
  childCountry: string;
  modelId: string;
}

router.get('/page/:pageNum', async (req: Request, res: Response) => {
  try {
    const pageNum = parseInt(req.params.pageNum, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page number' });
    }

    const { childAge, childCountry, provider, apiToken, modelId } = req.query;

    if (!childAge || !childCountry || !provider || !apiToken || !modelId) {
      return res.status(400).json({
        error: 'Missing required parameters: childAge, childCountry, provider, apiToken, modelId',
      });
    }

    try {
      const llmProvider = LLMFactory.createProvider(provider as any, apiToken as string);
      const contentService = new ContentGenerationService(llmProvider, modelId as string);

      const marketData = StockMarketLocalization.getCountryByName(childCountry as string);

      // Generate stories for this page
      const storiesPerPage = 4;

      const page = await contentService.generateNewspaperContent({
        childAge: parseInt(childAge as string, 10),
        childCountry: childCountry as string,
        stockMarketIndex: marketData?.primaryIndex,
        currency: marketData?.currency,
        pageNum: pageNum,
        storiesPerPage: storiesPerPage,
      });

      if (!page || !page.stories || page.stories.length === 0) {
        return res.status(404).json({ error: 'No newspaper content available' });
      }

      return res.json({
        pageNumber: page.pageNumber,
        totalPages: page.totalPages,
        stories: page.stories,
      });
    } catch (error) {
      console.error('Error generating content:', error);
      return res.status(500).json({ error: 'Failed to generate newspaper content' });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Newspaper page error:', errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
});

router.get('/regenerate', async (req: Request, res: Response) => {
  try {
    const { childCountry, provider, apiToken, modelId } = req.query;

    if (!childCountry || !provider || !apiToken || !modelId) {
      return res.status(400).json({
        error: 'Missing required parameters: childCountry, provider, apiToken, modelId',
      });
    }

    const cacheKey = `newspaper-${childCountry}-*-${modelId}`;
    const keys = Array.from({ length: 7 }, (_, i) => `newspaper-${childCountry}-${10 + i}-${modelId}`);

    keys.forEach((key) => newspaperPageCache.delete(key));

    return res.json({ success: true, message: 'Content cache cleared. New content will be generated on next request.' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: errorMessage });
  }
});

export default router;
