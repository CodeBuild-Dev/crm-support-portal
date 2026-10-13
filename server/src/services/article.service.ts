import { eq, asc, desc, ilike, or, and, sql, count } from 'drizzle-orm';
import { db, articles, folders, categories, articleVersions, searchLogs } from 'drizzle';

// Small English stopword list — common words that add no signal to
// article retrieval. Trimmed on purpose; keeping it short makes
// single-keyword queries still work (e.g. "contact", "setup").
const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'doing', 'have', 'has', 'had', 'having',
  'how', 'what', 'why', 'when', 'where', 'who', 'which',
  'can', 'could', 'would', 'should', 'shall', 'will', 'may', 'might',
  'my', 'me', 'i', 'we', 'our', 'us', 'your', 'you', 'yours',
  'to', 'from', 'of', 'in', 'on', 'for', 'with', 'about', 'at', 'by',
  'help', 'please', 'need', 'want', 'just', 'there', 'it', 'this', 'that',
]);

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

export const articleService = {
  async listByFolder(folderId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [total] = await db.select({ count: count() }).from(articles).where(eq(articles.folderId, folderId));
    const data = await db
      .select()
      .from(articles)
      .where(eq(articles.folderId, folderId))
      .orderBy(asc(articles.sortOrder))
      .limit(limit)
      .offset(offset);
    return { data, total: total.count, page, limit, totalPages: Math.ceil(total.count / limit) };
  },

  async getBySlug(slug: string) {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (!article) return null;

    const [folder] = await db.select().from(folders).where(eq(folders.id, article.folderId)).limit(1);
    if (!folder) return null;

    const [category] = await db.select().from(categories).where(eq(categories.id, folder.categoryId)).limit(1);
    if (!category) return null;

    const relatedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.folderId, folder.id))
      .orderBy(asc(articles.sortOrder));

    return { article, folder, category, relatedArticles };
  },

  async getById(id: string) {
    const [article] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    return article || null;
  },

  async search(query: string, limit = 10) {
    const pattern = `%${query}%`;
    const results = await db
      .select({
        article: articles,
        folderTitle: folders.title,
        categoryTitle: categories.title,
        categorySlug: categories.slug,
      })
      .from(articles)
      .innerJoin(folders, eq(articles.folderId, folders.id))
      .innerJoin(categories, eq(folders.categoryId, categories.id))
      .where(
        or(
          ilike(articles.title, pattern),
          ilike(articles.description, pattern),
          ilike(articles.content, pattern),
        ),
      )
      .limit(limit);

    // Log search
    await db.insert(searchLogs).values({ query, resultCount: results.length }).catch(() => {});

    return results.map((r) => ({
      ...r.article,
      folderTitle: r.folderTitle,
      categoryTitle: r.categoryTitle,
      categorySlug: r.categorySlug,
    }));
  },

  /**
   * RAG-friendly search for the chat bot.
   * Tokenizes the query into keywords (drops stopwords), over-fetches
   * any article matching ANY keyword across title/description/content,
   * then ranks by weighted token-hit count (title > description > content).
   * Falls back to phrase search when the query has no usable keywords.
   */
  async searchForChat(query: string, limit = 5) {
    const tokens = tokenize(query);

    if (tokens.length === 0) {
      return articleService.search(query, limit);
    }

    const orConditions = tokens.flatMap((tok) => {
      const pat = `%${tok}%`;
      return [ilike(articles.title, pat), ilike(articles.description, pat), ilike(articles.content, pat)];
    });

    const rows = await db
      .select({
        article: articles,
        folderTitle: folders.title,
        categoryTitle: categories.title,
        categorySlug: categories.slug,
      })
      .from(articles)
      .innerJoin(folders, eq(articles.folderId, folders.id))
      .innerJoin(categories, eq(folders.categoryId, categories.id))
      .where(and(eq(articles.isPublished, true), or(...orConditions)))
      .limit(limit * 4); // over-fetch so scoring can pick the best

    const scored = rows.map((r) => {
      const titleLower = (r.article.title ?? '').toLowerCase();
      const descLower = (r.article.description ?? '').toLowerCase();
      const contentLower = (r.article.content ?? '').toLowerCase();
      let score = 0;
      let matchedTokens = 0;
      for (const tok of tokens) {
        let hit = false;
        if (titleLower.includes(tok)) { score += 5; hit = true; }
        if (descLower.includes(tok)) { score += 2; hit = true; }
        if (contentLower.includes(tok)) { score += 1; hit = true; }
        if (hit) matchedTokens += 1;
      }
      // Bonus: article that matches multiple distinct tokens is much more relevant
      score += matchedTokens * matchedTokens;
      return { row: r, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, limit).map(({ row }) => ({
      ...row.article,
      folderTitle: row.folderTitle,
      categoryTitle: row.categoryTitle,
      categorySlug: row.categorySlug,
    }));

    await db.insert(searchLogs).values({ query, resultCount: top.length }).catch(() => {});
    return top;
  },

  async getPopular(limit = 12) {
    const results = await db
      .select({
        article: articles,
        categoryTitle: categories.title,
      })
      .from(articles)
      .innerJoin(folders, eq(articles.folderId, folders.id))
      .innerJoin(categories, eq(folders.categoryId, categories.id))
      .where(eq(articles.isPublished, true))
      .orderBy(desc(articles.viewCount))
      .limit(limit);

    return results.map((r) => ({
      ...r.article,
      categoryTitle: r.categoryTitle,
    }));
  },

  async create(data: {
    folderId: string;
    title: string;
    slug: string;
    description?: string;
    content?: string;
    author?: string;
  }) {
    const [article] = await db.insert(articles).values(data).returning();
    // Save initial version
    await db.insert(articleVersions).values({
      articleId: article.id,
      title: article.title,
      slug: article.slug,
      description: article.description,
      content: article.content,
      version: 1,
    });
    return article;
  },

  async update(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      description: string;
      content: string;
      author: string;
      sortOrder: number;
      isPublished: boolean;
    }>,
  ) {
    const [article] = await db.update(articles).set(data).where(eq(articles.id, id)).returning();
    if (!article) return null;

    // Save version if content changed
    if (data.title || data.content || data.description) {
      const [lastVersion] = await db
        .select()
        .from(articleVersions)
        .where(eq(articleVersions.articleId, id))
        .orderBy(desc(articleVersions.version))
        .limit(1);

      const nextVersion = lastVersion ? lastVersion.version + 1 : 1;
      await db.insert(articleVersions).values({
        articleId: id,
        title: article.title,
        slug: article.slug,
        description: article.description,
        content: article.content,
        version: nextVersion,
      });
    }

    return article;
  },

  async delete(id: string) {
    await db.delete(articles).where(eq(articles.id, id));
  },

  async incrementViewCount(id: string) {
    await db
      .update(articles)
      .set({ viewCount: sql`${articles.viewCount} + 1` })
      .where(eq(articles.id, id));
  },

  async vote(id: string, helpful: boolean) {
    if (helpful) {
      await db.update(articles).set({ helpfulCount: sql`${articles.helpfulCount} + 1` }).where(eq(articles.id, id));
    } else {
      await db.update(articles).set({ notHelpfulCount: sql`${articles.notHelpfulCount} + 1` }).where(eq(articles.id, id));
    }
  },

  async getVersions(articleId: string) {
    return db
      .select()
      .from(articleVersions)
      .where(eq(articleVersions.articleId, articleId))
      .orderBy(desc(articleVersions.version));
  },

  async restoreVersion(articleId: string, versionId: string) {
    const [version] = await db.select().from(articleVersions).where(eq(articleVersions.id, versionId)).limit(1);
    if (!version) return null;

    const [article] = await db
      .update(articles)
      .set({ title: version.title, slug: version.slug, description: version.description, content: version.content })
      .where(eq(articles.id, articleId))
      .returning();

    return article;
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    for (const item of items) {
      await db.update(articles).set({ sortOrder: item.sortOrder }).where(eq(articles.id, item.id));
    }
  },
};
