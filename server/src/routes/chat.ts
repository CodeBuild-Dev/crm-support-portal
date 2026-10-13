import { Router } from 'express';
import { z } from 'zod';
import { chatService } from '../services/chat.service.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(30),
});

// POST /api/chat
router.post('/', validate(bodySchema), async (req, res, next) => {
  try {
    const result = await chatService.reply(req.body.messages);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/chat/summarize — condense a transcript into a short
// third-person problem summary for the admin ticket queue.
router.post('/summarize', validate(bodySchema), async (req, res, next) => {
  try {
    const result = await chatService.summarize(req.body.messages);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
