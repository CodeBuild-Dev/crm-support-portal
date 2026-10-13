import { Router } from 'express';
import { z } from 'zod';
import { ticketService } from '../services/ticket.service.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';
import { ticketLimiter } from '../middleware/rateLimit.js';

const router = Router();

const transcriptMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  subject: z.string().min(1).max(255),
  description: z.string().min(1),
  transcript: z.array(transcriptMessageSchema).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const updateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  adminNotes: z.string().optional(),
});

// GET /api/tickets/stats
router.get('/stats', requireAuth, async (_req, res, next) => {
  try {
    const stats = await ticketService.stats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets?status=open
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const statusParam = req.query.status as string | undefined;
    const allowed = ['open', 'in_progress', 'closed'] as const;
    const status = statusParam && (allowed as readonly string[]).includes(statusParam)
      ? (statusParam as typeof allowed[number])
      : undefined;
    const list = await ticketService.list({ status });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// GET /api/tickets/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const ticket = await ticketService.get(req.params.id as string);
    if (!ticket) throw new AppError(404, 'Ticket not found');
    res.json(ticket);
  } catch (err) {
    next(err);
  }
});

// POST /api/tickets (public — called from chat widget)
router.post('/', ticketLimiter, validate(createSchema), async (req, res, next) => {
  try {
    const ticket = await ticketService.create(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tickets/:id (admin)
router.patch('/:id', requireEditor, validate(updateSchema), async (req, res, next) => {
  try {
    const ticket = await ticketService.update(req.params.id as string, req.body);
    if (!ticket) throw new AppError(404, 'Ticket not found');
    res.json(ticket);
  } catch (err) {
    next(err);
  }
});

export default router;
