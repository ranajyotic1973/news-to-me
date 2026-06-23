import { Router, Request, Response } from 'express';
import { ConfigurationService } from '../services/ConfigurationService';

const router = Router();

router.post('/validate-token', async (req: Request, res: Response) => {
  try {
    const { provider, apiToken } = req.body;

    if (!provider || !apiToken) {
      return res.status(400).json({ error: 'Provider and API token are required' });
    }

    const result = await ConfigurationService.validateAndListModels(provider, apiToken);

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({
      valid: true,
      models: result.models,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: errorMessage });
  }
});

router.get('/list-models', async (_req: Request, res: Response) => {
  try {
    const { provider, apiToken } = _req.query;

    if (!provider || !apiToken) {
      return res.status(400).json({ error: 'Provider and API token are required' });
    }

    const result = await ConfigurationService.validateAndListModels(
      provider as string,
      apiToken as string
    );

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    const cheapestModel = ConfigurationService.selectMostEconomicalModel(result.models!);

    return res.json({
      models: result.models,
      recommended: cheapestModel,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: errorMessage });
  }
});

router.get('/providers', (_req: Request, res: Response) => {
  const providers = ConfigurationService.getSupportedProviders();
  return res.json({ providers });
});

export default router;
