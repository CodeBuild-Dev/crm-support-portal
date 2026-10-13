import { eq, desc, count, and, SQL } from 'drizzle-orm';
import { db, tickets } from 'drizzle';
import type { TicketStatus, TicketPriority, TranscriptMessage } from 'shared';
import { emailService } from './email.service.js';

export const ticketService = {
  async list(filters?: { status?: TicketStatus }) {
    const conditions: SQL[] = [];
    if (filters?.status) conditions.push(eq(tickets.status, filters.status));
    const where = conditions.length ? and(...conditions) : undefined;

    return db
      .select()
      .from(tickets)
      .where(where)
      .orderBy(desc(tickets.createdAt));
  },

  async stats() {
    const [open] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'open'));
    const [inProgress] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'in_progress'));
    const [closed] = await db.select({ count: count() }).from(tickets).where(eq(tickets.status, 'closed'));
    return {
      open: open.count,
      inProgress: inProgress.count,
      closed: closed.count,
      total: open.count + inProgress.count + closed.count,
    };
  },

  async get(id: string) {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
    return ticket || null;
  },

  async create(data: {
    name: string;
    email: string;
    subject: string;
    description: string;
    transcript?: TranscriptMessage[];
    priority?: TicketPriority;
  }) {
    const [ticket] = await db
      .insert(tickets)
      .values({
        name: data.name,
        email: data.email,
        subject: data.subject,
        description: data.description,
        transcript: data.transcript ?? [],
        priority: data.priority ?? 'medium',
      })
      .returning();
    return ticket;
  },

  async update(
    id: string,
    data: Partial<{ status: TicketStatus; priority: TicketPriority; adminNotes: string }>,
  ) {
    const before = await ticketService.get(id);
    const [ticket] = await db
      .update(tickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    if (!ticket) return null;

    // If the admin transitioned this ticket to 'closed' (and it wasn't
    // already closed), notify the customer. Fire-and-forget — email
    // failures must not break the ticket update.
    if (data.status === 'closed' && before && before.status !== 'closed') {
      void emailService.sendTicketClosed({
        id: ticket.id,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        adminNotes: ticket.adminNotes,
      });
    }

    return ticket;
  },
};
