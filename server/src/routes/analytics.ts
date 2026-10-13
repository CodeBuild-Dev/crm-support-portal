import { Router } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', requireAuth, async (_req, res, next) => {
  try {
    const data = await analyticsService.getOverview();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/top-articles
router.get('/top-articles', requireAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await analyticsService.getTopArticles(limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/top-searches
router.get('/top-searches', requireAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await analyticsService.getTopSearches(limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/zero-results
router.get('/zero-results', requireAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await analyticsService.getZeroResultSearches(limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
