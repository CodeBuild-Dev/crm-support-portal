import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { db, stageEntries } from 'drizzle';

export const stageEntryService = {
  async create(data: { dealId: string; stageName: string; enteredAt: Date }) {
    const [entry] = await db.insert(stageEntries).values(data).returning();
    return entry;
  },

  /**
   * Count distinct deals that entered `stageName` within [startDate, endDate).
   * Distinct-by-deal so duplicate webhook fires for the same deal don't double-count.
   */
  async countInRange(params: { stageName: string; startDate: Date; endDate: Date }) {
    const { stageName, startDate, endDate } = params;
    const [row] = await db
      .select({ count: sql<number>`count(distinct ${stageEntries.dealId})::int` })
      .from(stageEntries)
      .where(
        and(
          eq(stageEntries.stageName, stageName),
          gte(stageEntries.enteredAt, startDate),
          lt(stageEntries.enteredAt, endDate),
        ),
      );
    return row?.count ?? 0;
  },
};
