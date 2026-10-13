import { Router } from 'express';
import { z } from 'zod';
import { articleService } from '../services/article.service.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';

const router = Router();

const createSchema = z.object({
  folderId: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().optional(),
  content: z.string().optional(),
  author: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  author: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/articles/search?q=xxx
router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) return res.json([]);
    const limit = parseInt(req.query.limit as string) || 10;
    const results = await articleService.search(q, limit);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/popular
router.get('/popular', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 12;
    const results = await articleService.getPopular(limit);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/by-slug/:slug
router.get('/by-slug/:slug', async (req, res, next) => {
  try {
    const result = await articleService.getBySlug(req.params.slug);
    if (!result) throw new AppError(404, 'Article not found');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/articles?folderId=xxx
router.get('/', async (req, res, next) => {
  try {
    const folderId = req.query.folderId as string;
    if (!folderId) throw new AppError(400, 'folderId query param required');
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const arts = await articleService.listByFolder(folderId, page, limit);
    res.json(arts);
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/:id
router.get('/:id', async (req, res, next) => {
  try {
    const article = await articleService.getById(req.params.id);
    if (!article) throw new AppError(404, 'Article not found');
    res.json(article);
  } catch (err) {
    next(err);
  }
});

// POST /api/articles
router.post('/', requireEditor, validate(createSchema), async (req, res, next) => {
  try {
    const article = await articleService.create(req.body);
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/articles/:id
router.patch('/:id', requireEditor, validate(updateSchema), async (req, res, next) => {
  try {
    const article = await articleService.update(req.params.id as string, req.body);
    if (!article) throw new AppError(404, 'Article not found');
    res.json(article);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/articles/:id
router.delete('/:id', requireEditor, async (req, res, next) => {
  try {
    await articleService.delete(req.params.id as string);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/:id/view
router.post('/:id/view', async (req, res, next) => {
  try {
    await articleService.incrementViewCount(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/:id/vote
router.post('/:id/vote', async (req, res, next) => {
  try {
    const { helpful } = req.body;
    if (typeof helpful !== 'boolean') throw new AppError(400, 'helpful must be a boolean');
    await articleService.vote(req.params.id, helpful);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/:id/versions
router.get('/:id/versions', requireAuth, async (req, res, next) => {
  try {
    const versions = await articleService.getVersions(req.params.id as string);
    res.json(versions);
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/:id/restore/:versionId
router.post('/:id/restore/:versionId', requireEditor, async (req, res, next) => {
  try {
    const article = await articleService.restoreVersion(req.params.id as string, req.params.versionId as string);
    if (!article) throw new AppError(404, 'Version not found');
    res.json(article);
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/reorder
router.post('/reorder', requireEditor, async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) throw new AppError(400, 'items must be an array');
    await articleService.reorder(items);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
