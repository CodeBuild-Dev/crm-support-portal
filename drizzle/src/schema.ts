import { pgTable, uuid, varchar, text, boolean, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

// ============================================
// Categories
// ============================================

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// Folders
// ============================================

export const folders = pgTable('folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// Articles
// ============================================

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  folderId: uuid('folder_id').notNull().references(() => folders.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  content: text('content'),
  author: varchar('author', { length: 255 }),
  sortOrder: integer('sort_order').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(true),
  viewCount: integer('view_count').notNull().default(0),
  helpfulCount: integer('helpful_count').notNull().default(0),
  notHelpfulCount: integer('not_helpful_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// User Profiles (extends Supabase auth.users)
// ============================================

export const userProfiles = pgTable('user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 320 }).unique(),
  passwordHash: text('password_hash'),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 50 }).notNull().default('viewer'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// Article Versions (History)
// ============================================

export const articleVersions = pgTable('article_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content'),
  version: integer('version').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// Search Analytics
// ============================================

export const searchLogs = pgTable('search_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  query: varchar('query', { length: 500 }).notNull(),
  resultCount: integer('result_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// Pipeline Stage Entries (CRM webhook)
// ============================================

export const stageEntries = pgTable('stage_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: varchar('deal_id', { length: 255 }).notNull(),
  stageName: varchar('stage_name', { length: 255 }).notNull(),
  enteredAt: timestamp('entered_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// Audit Logs
// ============================================

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  previousValue: jsonb('previous_value'),
  newValue: jsonb('new_value'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  performedAt: timestamp('performed_at').notNull().defaultNow(),
});

// ============================================
// Support Tickets (raised from chat widget)
// ============================================

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  transcript: jsonb('transcript').$type<Array<{ role: 'user' | 'assistant'; content: string }>>().default([]),
  status: varchar('status', { length: 32 }).notNull().default('open'),
  priority: varchar('priority', { length: 16 }).notNull().default('medium'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// AI Chat Settings (singleton — one row)
// ============================================

export const aiSettings = pgTable('ai_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  botName: varchar('bot_name', { length: 100 }).notNull().default('Aria'),
  systemPrompt: text('system_prompt').notNull(),
  model: varchar('model', { length: 64 }).notNull().default('claude-sonnet-4-6'),
  enabled: boolean('enabled').notNull().default(true),
  welcomeMessage: text('welcome_message').notNull().default('Hi! Ask me anything about using the platform.'),
  suggestions: jsonb('suggestions').$type<string[]>().notNull().default([]),
  maxArticlesPerQuery: integer('max_articles_per_query').notNull().default(5),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// Email Settings (singleton — templates + enable flag)
// SMTP credentials live in env vars, not the DB.
// ============================================

export const emailSettings = pgTable('email_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  enabled: boolean('enabled').notNull().default(false),
  fromName: varchar('from_name', { length: 200 }).notNull().default('Support Team'),
  closeSubject: varchar('close_subject', { length: 255 }).notNull().default('Your support ticket has been resolved — {{subject}}'),
  closeBody: text('close_body').notNull().default(
    'Hi {{name}},\n\nWe\'re letting you know your support ticket has been resolved.\n\nTicket reference: {{ticketRef}}\nSubject: {{subject}}\n\n{{adminNotes}}\n\nIf you have any further questions, feel free to reply to this email.\n\nThanks,\n{{fromName}}'
  ),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
