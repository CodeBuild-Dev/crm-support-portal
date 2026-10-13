import { eq, asc } from 'drizzle-orm';
import { db, categories, folders, articles } from 'drizzle';

export const categoryService = {
  async list() {
    const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));

    const result = await Promise.all(
      cats.map(async (cat) => {
        const flds = await db.select().from(folders).where(eq(folders.categoryId, cat.id)).orderBy(asc(folders.sortOrder));
        const foldersWithArticles = await Promise.all(
          flds.map(async (f) => {
            const arts = await db.select().from(articles).where(eq(articles.folderId, f.id)).orderBy(asc(articles.sortOrder));
            return { ...f, articles: arts };
          }),
        );
        const articleCount = foldersWithArticles.reduce((sum, f) => sum + f.articles.length, 0);
        return { ...cat, folders: foldersWithArticles, folderCount: flds.length, articleCount };
      }),
    );

    return result;
  },

  async getBySlug(slug: string) {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (!cat) return null;

    const flds = await db
      .select()
      .from(folders)
      .where(eq(folders.categoryId, cat.id))
      .orderBy(asc(folders.sortOrder));

    const foldersWithArticles = await Promise.all(
      flds.map(async (f) => {
        const arts = await db
          .select()
          .from(articles)
          .where(eq(articles.folderId, f.id))
          .orderBy(asc(articles.sortOrder));
        return { ...f, articles: arts };
      }),
    );

    return { ...cat, folders: foldersWithArticles };
  },

  async create(data: { title: string; slug: string; description?: string; icon?: string }) {
    const [cat] = await db.insert(categories).values(data).returning();
    return cat;
  },

  async update(id: string, data: Partial<{ title: string; slug: string; description: string; icon: string; sortOrder: number; isPublished: boolean }>) {
    const [cat] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return cat;
  },

  async delete(id: string) {
    await db.delete(categories).where(eq(categories.id, id));
  },
};
