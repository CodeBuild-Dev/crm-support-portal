import { eq } from 'drizzle-orm';
import { db, emailSettings } from 'drizzle';

const DEFAULT_CLOSE_SUBJECT = 'Your support ticket has been resolved — {{subject}}';
const DEFAULT_CLOSE_BODY = `Hi {{name}},

We're letting you know your support ticket has been resolved.

Ticket reference: {{ticketRef}}
Subject: {{subject}}

{{adminNotes}}

If you have any further questions, feel free to reply to this email.

Thanks,
{{fromName}}`;

export const emailSettingsService = {
  async get() {
    const [existing] = await db.select().from(emailSettings).limit(1);
    if (existing) return existing;

    const [created] = await db
      .insert(emailSettings)
      .values({
        enabled: false,
        fromName: 'Support Team',
        closeSubject: DEFAULT_CLOSE_SUBJECT,
        closeBody: DEFAULT_CLOSE_BODY,
      })
      .returning();
    return created;
  },

  async update(
    data: Partial<{
      enabled: boolean;
      fromName: string;
      closeSubject: string;
      closeBody: string;
    }>,
  ) {
    const current = await emailSettingsService.get();
    const [updated] = await db
      .update(emailSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(emailSettings.id, current.id))
      .returning();
    return updated;
  },
};
