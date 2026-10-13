import { Router } from 'express';
import { z } from 'zod';
import { categoryService } from '../services/category.service.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const createSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().optional(),
  icon: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/categories
router.get('/', async (_req, res, next) => {
  try {
    const cats = await categoryService.list();
    res.json(cats);
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const cat = await categoryService.getBySlug(req.params.slug);
    if (!cat) throw new AppError(404, 'Category not found');
    res.json(cat);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const cat = await categoryService.create(req.body);
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/categories/:id
router.patch('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    const cat = await categoryService.update(req.params.id as string, req.body);
    if (!cat) throw new AppError(404, 'Category not found');
    res.json(cat);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await categoryService.delete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
