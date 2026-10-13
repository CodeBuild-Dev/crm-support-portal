import { Router } from 'express';
import { z } from 'zod';
import { folderService } from '../services/folder.service.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const createSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/folders?categoryId=xxx
router.get('/', async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId as string;
    if (!categoryId) throw new AppError(400, 'categoryId query param required');
    const flds = await folderService.listByCategory(categoryId);
    res.json(flds);
  } catch (err) {
    next(err);
  }
});

// GET /api/folders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const folder = await folderService.getById(req.params.id);
    if (!folder) throw new AppError(404, 'Folder not found');
    res.json(folder);
  } catch (err) {
    next(err);
  }
});

// POST /api/folders
router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const folder = await folderService.create(req.body);
    res.status(201).json(folder);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/folders/:id
router.patch('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    const folder = await folderService.update(req.params.id as string, req.body);
    if (!folder) throw new AppError(404, 'Folder not found');
    res.json(folder);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/folders/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await folderService.delete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
