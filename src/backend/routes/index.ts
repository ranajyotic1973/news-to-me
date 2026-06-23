import { Router } from 'express';
import configRoutes from './config';
import newspaperRoutes from './newspaper';
import {
  createConfigLimiter,
  createNewspaperLimiter,
} from '../middleware/rateLimiter';

const router = Router();
const configLimiter = createConfigLimiter();
const newspaperLimiter = createNewspaperLimiter();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Config routes (stricter rate limiting)
router.use('/api/config', configLimiter.middleware(), configRoutes);

// Newspaper routes (moderate rate limiting)
router.use('/api/newspaper', newspaperLimiter.middleware(), newspaperRoutes);

export default router;
