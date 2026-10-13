import Anthropic from '@anthropic-ai/sdk';
import { articleService } from './article.service.js';
import { aiSettingsService } from './aiSettings.service.js';
import { AppError } from '../middleware/errorHandler.js';
import type { TranscriptMessage } from 'shared';

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '…';
}

export const chatService = {
  async reply(messages: TranscriptMessage[]) {
    const settings = await aiSettingsService.get();

    if (!settings.enabled) {
      throw new AppError(503, 'AI chat is currently disabled by the administrator.');
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new AppError(500, 'ANTHROPIC_API_KEY is not configured on the server.');
    }

    if (!messages.length) {
      throw new AppError(400, 'messages cannot be empty.');
    }

    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) {
      throw new AppError(400, 'messages must contain at least one user message.');
    }

    // RAG — find relevant articles for the latest user question.
    // searchForChat tokenizes the query + ranks by weighted token hits,
    // which handles phrasing like "how to create a contact" → "Create New Contact"
    // that naive ILIKE phrase-match misses.
    const matches = await articleService
      .searchForChat(lastUser.content, settings.maxArticlesPerQuery)
      .catch(() => []);

    const contextBlock = matches.length
      ? matches
          .map((a: any, i: number) => {
            const body = [a.description, stripHtml(a.content || '')].filter(Boolean).join('\n');
            return `[${i + 1}] TITLE: ${a.title}\nCATEGORY: ${a.categoryTitle ?? ''} / ${a.folderTitle ?? ''}\n${truncate(body, 1500)}`;
          })
          .join('\n\n---\n\n')
      : '(No matching articles found in the knowledge base.)';

    const system = `${settings.systemPrompt}

=== RELEVANT KNOWLEDGE-BASE ARTICLES (use these to answer) ===
${contextBlock}
=== END OF ARTICLES ===

Instructions:
- If the articles above contain the answer, answer confidently using them. Do NOT say you don't have the article when one is present above.
- Cite the article title in your reply so the user knows the source.
- If NONE of the articles match the question, say so briefly and suggest raising a ticket.
- Keep answers short and friendly — 1-3 paragraphs or a numbered list.`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    try {
      const response = await anthropic.messages.create({
        model: settings.model,
        max_tokens: 1024,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      const textPart = response.content.find((p) => p.type === 'text');
      const reply = textPart && textPart.type === 'text' ? textPart.text : '';

      return {
        reply: reply || "I'm sorry, I couldn't generate a reply. Please try again or raise a ticket.",
        citedArticleIds: matches.map((a: any) => a.id),
        citedArticles: matches.map((a: any) => ({ id: a.id, title: a.title, slug: a.slug })),
      };
    } catch (err: any) {
      console.error('[chat] Anthropic API error:', err?.message || err);
      throw new AppError(502, 'Failed to reach the AI provider. Please try again shortly.');
    }
  },

  /**
   * Summarize a chat transcript into a short problem statement the
   * admin can skim at a glance. Used to pre-fill the ticket Description
   * when the customer clicks "Raise a ticket".
   */
  async summarize(messages: TranscriptMessage[]) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new AppError(500, 'ANTHROPIC_API_KEY is not configured on the server.');
    }
    if (!messages.length) {
      throw new AppError(400, 'messages cannot be empty.');
    }

    const settings = await aiSettingsService.get();

    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const system = `You are summarizing a customer's support chat so that a human agent can triage the ticket quickly.

Write a SHORT problem summary (2-4 sentences, plain prose — no markdown, no lists, no preamble) that captures:
- What the customer is trying to do
- What's blocking them or what specific help they need
- Any relevant context they shared (platform area, error messages, etc.)

Write from a neutral third-person perspective ("The customer is trying to..."). Do not address the customer directly. Do not include the chat history itself.`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    try {
      const response = await anthropic.messages.create({
        model: settings.model,
        max_tokens: 400,
        system,
        messages: [
          {
            role: 'user',
            content: `Here is the chat transcript:\n\n${transcript}\n\nWrite the problem summary now.`,
          },
        ],
      });
      const textPart = response.content.find((p) => p.type === 'text');
      const summary = textPart && textPart.type === 'text' ? textPart.text.trim() : '';
      return { summary };
    } catch (err: any) {
      console.error('[chat] summarize error:', err?.message || err);
      throw new AppError(502, 'Failed to generate a summary. Please try again shortly.');
    }
  },
};
