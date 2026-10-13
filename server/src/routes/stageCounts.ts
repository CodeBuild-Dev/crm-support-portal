import { Router } from 'express';
import { z } from 'zod';
import { stageEntryService } from '../services/stageEntry.service.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const querySchema = z.object({
  stage_name: z.string().min(1, 'stage_name is required'),
  filter: z.enum(['this_week', 'last_week', 'custom']).default('this_week'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

/**
 * Monday-anchored week in UTC. Returns [start, end) — end is exclusive.
 * `weekOffset`: 0 = this week, -1 = last week.
 */
function weekRange(weekOffset: number): { start: Date; end: Date } {
  const now = new Date();
  // getUTCDay: 0=Sun..6=Sat. Shift so Monday=0.
  const mondayIndex = (now.getUTCDay() + 6) % 7;
  const thisWeekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - mondayIndex),
  );
  const start = new Date(thisWeekStart);
  start.setUTCDate(start.getUTCDate() + weekOffset * 7);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

// GET /api/stage-counts?stage_name=...&filter=...&start_date=...&end_date=...
router.get('/', async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.errors[0]?.message ?? 'Invalid query');
    }
    const { stage_name, filter, start_date, end_date } = parsed.data;

    let start: Date;
    let end: Date;

    if (filter === 'this_week') {
      ({ start, end } = weekRange(0));
    } else if (filter === 'last_week') {
      ({ start, end } = weekRange(-1));
    } else {
      if (!start_date || !end_date) {
        throw new AppError(400, 'start_date and end_date are required when filter=custom');
      }
      const s = new Date(start_date);
      const e = new Date(end_date);
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
        throw new AppError(400, 'start_date and end_date must be valid ISO dates');
      }
      if (s > e) {
        throw new AppError(400, 'start_date must be <= end_date');
      }
      start = s;
      // Make end-date inclusive: bump by 1 day so the full day is covered.
      end = new Date(e);
      end.setUTCDate(end.getUTCDate() + 1);
    }

    const count = await stageEntryService.countInRange({
      stageName: stage_name,
      startDate: start,
      endDate: end,
    });

    res.json({
      stage_name,
      count,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
