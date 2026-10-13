import { Router } from 'express';
import { z } from 'zod';
import { stageEntryService } from '../services/stageEntry.service.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// CRM pipeline stage-change payload.
// We accept both camelCase (dealId/stageName) and snake_case (deal_id/stage_name)
// because many CRM workflow webhooks emit snake_case keys.
const webhookSchema = z
  .object({
    dealId: z.string().min(1).max(255).optional(),
    deal_id: z.string().min(1).max(255).optional(),
    stageName: z.string().min(1).max(255).optional(),
    stage_name: z.string().min(1).max(255).optional(),
    timestamp: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'timestamp must be ISO 8601' }),
  })
  .refine((d) => d.dealId ?? d.deal_id, { message: 'dealId is required', path: ['dealId'] })
  .refine((d) => d.stageName ?? d.stage_name, {
    message: 'stageName is required',
    path: ['stageName'],
  });

// POST /webhook/stage-change
router.post('/stage-change', validate(webhookSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof webhookSchema>;
    const dealId = (body.dealId ?? body.deal_id) as string;
    const stageName = (body.stageName ?? body.stage_name) as string;

    const entry = await stageEntryService.create({
      dealId,
      stageName,
      enteredAt: new Date(body.timestamp),
    });

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

export default router;
