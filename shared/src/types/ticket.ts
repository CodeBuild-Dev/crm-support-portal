export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  description: string;
  transcript: TranscriptMessage[];
  status: TicketStatus;
  priority: TicketPriority;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketInput {
  name: string;
  email: string;
  subject: string;
  description: string;
  transcript?: TranscriptMessage[];
  priority?: TicketPriority;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  adminNotes?: string;
}
