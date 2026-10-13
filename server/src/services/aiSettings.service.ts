import { eq } from 'drizzle-orm';
import { db, aiSettings } from 'drizzle';

const DEFAULT_SYSTEM_PROMPT = `You are a friendly, concise support agent for this product.

Your job is to help customers resolve questions using ONLY the information in the knowledge-base articles provided to you in the system message. If an article contains the answer, quote or paraphrase the relevant steps. If none of the provided articles answer the question, say so honestly and suggest the customer raises a support ticket — do NOT invent product details.

Keep answers short: 1-3 short paragraphs or a numbered list. Use plain language. When you reference an article, mention its title in your reply so the customer knows the source.`;

const DEFAULT_SUGGESTIONS = [
  'How do I get started?',
  'How do I set up my account?',
  'What features are available?',
  'How do I contact support?',
];

export const aiSettingsService = {
  /**
   * Reads the singleton row, creating a default row if the table is empty.
   */
  async get() {
    const [existing] = await db.select().from(aiSettings).limit(1);
    if (existing) return existing;

    const [created] = await db
      .insert(aiSettings)
      .values({
        botName: 'Aria',
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        model: 'claude-sonnet-4-6',
        enabled: true,
        welcomeMessage: 'Hi! Ask me anything about using the platform.',
        suggestions: DEFAULT_SUGGESTIONS,
        maxArticlesPerQuery: 5,
      })
      .returning();
    return created;
  },

  async update(
    data: Partial<{
      botName: string;
      systemPrompt: string;
      model: string;
      enabled: boolean;
      welcomeMessage: string;
      suggestions: string[];
      maxArticlesPerQuery: number;
    }>,
  ) {
    const current = await aiSettingsService.get();
    const [updated] = await db
      .update(aiSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiSettings.id, current.id))
      .returning();
    return updated;
  },
};
