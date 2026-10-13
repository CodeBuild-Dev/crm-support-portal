import { eq, asc } from 'drizzle-orm';
import { db, folders, articles } from 'drizzle';

export const folderService = {
  async listByCategory(categoryId: string) {
    const flds = await db
      .select()
      .from(folders)
      .where(eq(folders.categoryId, categoryId))
      .orderBy(asc(folders.sortOrder));

    return Promise.all(
      flds.map(async (f) => {
        const arts = await db.select().from(articles).where(eq(articles.folderId, f.id));
        return { ...f, articleCount: arts.length };
      }),
    );
  },

  async getById(id: string) {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id)).limit(1);
    if (!folder) return null;

    const arts = await db
      .select()
      .from(articles)
      .where(eq(articles.folderId, id))
      .orderBy(asc(articles.sortOrder));

    return { ...folder, articles: arts };
  },

  async create(data: { categoryId: string; title: string; slug: string; description?: string }) {
    const [folder] = await db.insert(folders).values(data).returning();
    return folder;
  },

  async update(id: string, data: Partial<{ title: string; slug: string; description: string; sortOrder: number; isPublished: boolean }>) {
    const [folder] = await db.update(folders).set(data).where(eq(folders.id, id)).returning();
    return folder;
  },

  async delete(id: string) {
    await db.delete(folders).where(eq(folders.id, id));
  },
};
