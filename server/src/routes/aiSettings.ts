import { Router } from 'express';
import { z } from 'zod';
import { aiSettingsService } from '../services/aiSettings.service.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

const updateSchema = z.object({
  botName: z.string().min(1).max(100).optional(),
  systemPrompt: z.string().min(1).optional(),
  model: z.string().min(1).max(64).optional(),
  enabled: z.boolean().optional(),
  welcomeMessage: z.string().min(1).optional(),
  suggestions: z.array(z.string().min(1).max(200)).max(10).optional(),
  maxArticlesPerQuery: z.number().int().min(1).max(20).optional(),
});

// GET /api/ai-settings — public subset used by the chat widget
router.get('/', async (_req, res, next) => {
  try {
    const settings = await aiSettingsService.get();
    res.json({
      enabled: settings.enabled,
      botName: settings.botName,
      welcomeMessage: settings.welcomeMessage,
      suggestions: settings.suggestions ?? [],
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai-settings/admin — full record, including the system prompt
router.get('/admin', requireAuth, async (_req, res, next) => {
  try {
    res.json(await aiSettingsService.get());
  } catch (err) {
    next(err);
  }
});

// PATCH /api/ai-settings (admin)
router.patch('/', requireAdmin, validate(updateSchema), async (req, res, next) => {
  try {
    const updated = await aiSettingsService.update(req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
