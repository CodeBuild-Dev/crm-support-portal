import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import categoryRoutes from './routes/categories.js';
import folderRoutes from './routes/folders.js';
import articleRoutes from './routes/articles.js';
import analyticsRoutes from './routes/analytics.js';
import webhookRoutes from './routes/webhook.js';
import stageCountsRoutes from './routes/stageCounts.js';
import ticketRoutes from './routes/tickets.js';
import aiSettingsRoutes from './routes/aiSettings.js';
import chatRoutes from './routes/chat.js';
import emailSettingsRoutes from './routes/emailSettings.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

// API routes
app.use('/api/categories', categoryRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/stage-counts', stageCountsRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/ai-settings', aiSettingsRoutes);
app.use('/api/email-settings', emailSettingsRoutes);
app.use('/api/chat', chatRoutes);

// Webhook routes (no /api prefix — the CRM calls these directly)
app.use('/webhook', webhookRoutes);

// Error handling for API routes
app.use('/api/*', notFound);
app.use(errorHandler);

// Serve client static files in production
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});
