import { desc, sql, count, eq } from 'drizzle-orm';
import { db, articles, categories, folders, searchLogs } from 'drizzle';

export const analyticsService = {
  async getOverview() {
    const [catCount] = await db.select({ count: count() }).from(categories);
    const [folderCount] = await db.select({ count: count() }).from(folders);
    const [articleCount] = await db.select({ count: count() }).from(articles);
    const [publishedCount] = await db.select({ count: count() }).from(articles).where(eq(articles.isPublished, true));
    const [draftCount] = await db.select({ count: count() }).from(articles).where(eq(articles.isPublished, false));
    const [totalViews] = await db.select({ total: sql<number>`coalesce(sum(${articles.viewCount}), 0)` }).from(articles);
    const [totalHelpful] = await db.select({ total: sql<number>`coalesce(sum(${articles.helpfulCount}), 0)` }).from(articles);
    const [totalNotHelpful] = await db.select({ total: sql<number>`coalesce(sum(${articles.notHelpfulCount}), 0)` }).from(articles);

    return {
      categories: catCount.count,
      folders: folderCount.count,
      articles: articleCount.count,
      published: publishedCount.count,
      drafts: draftCount.count,
      totalViews: Number(totalViews.total),
      totalHelpful: Number(totalHelpful.total),
      totalNotHelpful: Number(totalNotHelpful.total),
    };
  },

  async getTopArticles(limit = 10) {
    return db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        viewCount: articles.viewCount,
        helpfulCount: articles.helpfulCount,
        notHelpfulCount: articles.notHelpfulCount,
      })
      .from(articles)
      .orderBy(desc(articles.viewCount))
      .limit(limit);
  },

  async getTopSearches(limit = 20) {
    const results = await db
      .select({
        query: searchLogs.query,
        searches: count(),
        avgResults: sql<number>`round(avg(${searchLogs.resultCount}))`,
      })
      .from(searchLogs)
      .groupBy(searchLogs.query)
      .orderBy(desc(count()))
      .limit(limit);

    return results;
  },

  async getZeroResultSearches(limit = 20) {
    return db
      .select({
        query: searchLogs.query,
        searches: count(),
      })
      .from(searchLogs)
      .where(eq(searchLogs.resultCount, 0))
      .groupBy(searchLogs.query)
      .orderBy(desc(count()))
      .limit(limit);
  },
};
