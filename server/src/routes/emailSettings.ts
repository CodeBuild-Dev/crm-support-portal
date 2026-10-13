import { Router } from 'express';
import { z } from 'zod';
import { emailSettingsService } from '../services/emailSettings.service.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  fromName: z.string().min(1).max(200).optional(),
  closeSubject: z.string().min(1).max(255).optional(),
  closeBody: z.string().min(1).optional(),
});

// GET /api/email-settings — admin only (no public reason to expose SMTP config)
router.get('/', async (_req, res, next) => {
  try {
    const settings = await emailSettingsService.get();
    // Report whether SMTP env vars are configured so the admin UI can
    // warn when emails will silently no-op.
    const smtpConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS,
    );
    res.json({ ...settings, smtpConfigured });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/email-settings
router.patch('/', validate(updateSchema), async (req, res, next) => {
  try {
    const updated = await emailSettingsService.update(req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
