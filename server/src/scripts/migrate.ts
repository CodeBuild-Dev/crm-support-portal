/**
 * Idempotent schema migration script for Railway startup.
 *
 * Runs a set of `IF NOT EXISTS` DDL statements directly against the
 * production Postgres. Safe to run on every boot — each statement
 * is a no-op if the column / table already has the expected shape.
 *
 * We use this instead of `drizzle-kit push --force` because push was
 * silently skipping ALTER TABLE operations on existing tables in the
 * non-TTY Railway container, leaving new columns missing.
 */
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('[migrate] DATABASE_URL not set — skipping migrations');
  process.exit(0);
}

const sql = postgres(url, { max: 1 });

const statements = [
  // --- categories / folders / articles / versions / search / stage / audit ---
  // These tables were created by an earlier drizzle-kit push. Keep idempotent
  // guards in case a fresh DB is ever provisioned.
  `CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title varchar(255) NOT NULL,
    slug varchar(255) NOT NULL UNIQUE,
    description text,
    icon varchar(100),
    sort_order integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS folders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    description text,
    sort_order integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS articles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id uuid NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    slug varchar(255) NOT NULL UNIQUE,
    description text,
    content text,
    author varchar(255),
    sort_order integer NOT NULL DEFAULT 0,
    is_published boolean NOT NULL DEFAULT true,
    view_count integer NOT NULL DEFAULT 0,
    helpful_count integer NOT NULL DEFAULT 0,
    not_helpful_count integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS article_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    description text,
    content text,
    version integer NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS search_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    query varchar(500) NOT NULL,
    result_count integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS stage_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id varchar(255) NOT NULL,
    stage_name varchar(255) NOT NULL,
    entered_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    action varchar(100) NOT NULL,
    entity_type varchar(50) NOT NULL,
    entity_id uuid NOT NULL,
    previous_value jsonb,
    new_value jsonb,
    ip_address varchar(50),
    user_agent text,
    performed_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY,
    display_name varchar(255) NOT NULL,
    avatar_url text,
    role varchar(50) NOT NULL DEFAULT 'viewer',
    is_active boolean NOT NULL DEFAULT true,
    last_login_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,

  // --- Support tickets (chat escalations) ---
  `CREATE TABLE IF NOT EXISTS tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(200) NOT NULL,
    email varchar(320) NOT NULL,
    subject varchar(255) NOT NULL,
    description text NOT NULL,
    transcript jsonb DEFAULT '[]'::jsonb,
    status varchar(32) NOT NULL DEFAULT 'open',
    priority varchar(16) NOT NULL DEFAULT 'medium',
    admin_notes text,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,

  // --- AI chat settings (singleton) ---
  `CREATE TABLE IF NOT EXISTS ai_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    system_prompt text NOT NULL,
    model varchar(64) NOT NULL DEFAULT 'claude-sonnet-4-6',
    enabled boolean NOT NULL DEFAULT true,
    welcome_message text NOT NULL DEFAULT 'Hi! Ask me anything about using the platform.',
    max_articles_per_query integer NOT NULL DEFAULT 5,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,

  // --- Additive columns for ai_settings (newer than initial creation) ---
  `ALTER TABLE ai_settings ADD COLUMN IF NOT EXISTS bot_name varchar(100) NOT NULL DEFAULT 'Aria'`,
  `ALTER TABLE ai_settings ADD COLUMN IF NOT EXISTS suggestions jsonb NOT NULL DEFAULT '[]'::jsonb`,

  // Seed default suggestions on the singleton ONLY when none are set yet.
  // ADD COLUMN with a default of '[]' leaves existing rows with an empty
  // array, which means the chat widget would show no suggestion chips.
  `UPDATE ai_settings
     SET suggestions = '["How do I get started?","How do I set up my account?","What features are available?","How do I contact support?"]'::jsonb
     WHERE suggestions IS NULL OR jsonb_array_length(suggestions) = 0`,

  // --- Email settings singleton (templates + enabled flag) ---
  // SMTP credentials live in env vars, not the DB.
  `CREATE TABLE IF NOT EXISTS email_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    enabled boolean NOT NULL DEFAULT false,
    from_name varchar(200) NOT NULL DEFAULT 'Support Team',
    close_subject varchar(255) NOT NULL DEFAULT 'Your support ticket has been resolved — {{subject}}',
    close_body text NOT NULL DEFAULT E'Hi {{name}},\\n\\nWe''re letting you know your support ticket has been resolved.\\n\\nTicket reference: {{ticketRef}}\\nSubject: {{subject}}\\n\\n{{adminNotes}}\\n\\nIf you have any further questions, feel free to reply to this email.\\n\\nThanks,\\n{{fromName}}',
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
];

async function run() {
  console.log(`[migrate] Applying ${statements.length} idempotent statements...`);
  for (const stmt of statements) {
    const firstLine = stmt.trim().split('\n')[0].slice(0, 80);
    try {
      await sql.unsafe(stmt);
      console.log(`[migrate] ok  — ${firstLine}`);
    } catch (err: any) {
      console.error(`[migrate] FAIL ${firstLine}`);
      console.error(`[migrate]      ${err?.message || err}`);
      throw err;
    }
  }
  await sql.end();
  console.log('[migrate] Complete.');
}

run().catch((err) => {
  console.error('[migrate] Aborted:', err?.message || err);
  process.exit(1);
});
