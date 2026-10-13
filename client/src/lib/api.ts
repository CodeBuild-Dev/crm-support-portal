const API_BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Fired when an admin request fails because the session expired. */
export const SESSION_EXPIRED_EVENT = 'auth:session-expired';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    if (res.status === 401 && !path.startsWith('/api/auth/')) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(res.status, err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    me: () => request<AuthUser>('/api/auth/me'),
    login: (email: string, password: string) =>
      request<AuthUser>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  },

  categories: {
    list: () => request<any[]>('/api/categories'),
    getBySlug: (slug: string) => request<any>(`/api/categories/${slug}`),
    create: (data: { title: string; slug: string; description?: string; icon?: string }) =>
      request<any>('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/categories/${id}`, { method: 'DELETE' }),
  },

  folders: {
    listByCategory: (categoryId: string) => request<any[]>(`/api/folders?categoryId=${categoryId}`),
    getById: (id: string) => request<any>(`/api/folders/${id}`),
    create: (data: { categoryId: string; title: string; slug: string; description?: string }) =>
      request<any>('/api/folders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/api/folders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/folders/${id}`, { method: 'DELETE' }),
  },

  articles: {
    listByFolder: (folderId: string, page = 1, limit = 20) =>
      request<{ data: any[]; total: number; page: number; totalPages: number }>(`/api/articles?folderId=${folderId}&page=${page}&limit=${limit}`),
    getBySlug: (slug: string) => request<any>(`/api/articles/by-slug/${slug}`),
    getById: (id: string) => request<any>(`/api/articles/${id}`),
    search: (q: string, limit = 10) => request<any[]>(`/api/articles/search?q=${encodeURIComponent(q)}&limit=${limit}`),
    popular: (limit = 12) => request<any[]>(`/api/articles/popular?limit=${limit}`),
    create: (data: { folderId: string; title: string; slug: string; description?: string; content?: string }) =>
      request<any>('/api/articles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/api/articles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/api/articles/${id}`, { method: 'DELETE' }),
    view: (id: string) =>
      request<void>(`/api/articles/${id}/view`, { method: 'POST' }),
    vote: (id: string, helpful: boolean) =>
      request<void>(`/api/articles/${id}/vote`, { method: 'POST', body: JSON.stringify({ helpful }) }),
    getVersions: (id: string) => request<any[]>(`/api/articles/${id}/versions`),
    restoreVersion: (id: string, versionId: string) =>
      request<any>(`/api/articles/${id}/restore/${versionId}`, { method: 'POST' }),
    reorder: (items: { id: string; sortOrder: number }[]) =>
      request<void>('/api/articles/reorder', { method: 'POST', body: JSON.stringify({ items }) }),
  },

  analytics: {
    overview: () => request<any>('/api/analytics/overview'),
    topArticles: (limit = 10) => request<any[]>(`/api/analytics/top-articles?limit=${limit}`),
    topSearches: (limit = 20) => request<any[]>(`/api/analytics/top-searches?limit=${limit}`),
    zeroResults: (limit = 20) => request<any[]>(`/api/analytics/zero-results?limit=${limit}`),
  },

  chat: {
    send: (messages: { role: 'user' | 'assistant'; content: string }[]) =>
      request<{ reply: string; citedArticleIds: string[]; citedArticles: { id: string; title: string; slug: string }[] }>(
        '/api/chat',
        { method: 'POST', body: JSON.stringify({ messages }) },
      ),
    summarize: (messages: { role: 'user' | 'assistant'; content: string }[]) =>
      request<{ summary: string }>('/api/chat/summarize', {
        method: 'POST',
        body: JSON.stringify({ messages }),
      }),
  },

  tickets: {
    list: (status?: 'open' | 'in_progress' | 'closed') =>
      request<any[]>(`/api/tickets${status ? `?status=${status}` : ''}`),
    stats: () => request<{ open: number; inProgress: number; closed: number; total: number }>('/api/tickets/stats'),
    get: (id: string) => request<any>(`/api/tickets/${id}`),
    create: (data: {
      name: string;
      email: string;
      subject: string;
      description: string;
      transcript?: { role: 'user' | 'assistant'; content: string }[];
      priority?: 'low' | 'medium' | 'high';
    }) => request<any>('/api/tickets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { status?: string; priority?: string; adminNotes?: string }) =>
      request<any>(`/api/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  emailSettings: {
    get: () => request<any>('/api/email-settings'),
    update: (data: {
      enabled?: boolean;
      fromName?: string;
      closeSubject?: string;
      closeBody?: string;
    }) => request<any>('/api/email-settings', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  aiSettings: {
    // Public call — returns enabled + branding/prompts for the widget
    getPublic: () =>
      request<{ enabled: boolean; botName: string; welcomeMessage: string; suggestions: string[] }>(
        '/api/ai-settings',
      ),
    // Admin call — returns full record
    getAdmin: () => request<any>('/api/ai-settings/admin'),
    update: (data: {
      botName?: string;
      systemPrompt?: string;
      model?: string;
      enabled?: boolean;
      welcomeMessage?: string;
      suggestions?: string[];
      maxArticlesPerQuery?: number;
    }) => request<any>('/api/ai-settings', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  stageCounts: {
    get: (params: {
      stage_name: string;
      filter: 'this_week' | 'last_week' | 'custom';
      start_date?: string;
      end_date?: string;
    }) => {
      const q = new URLSearchParams({ stage_name: params.stage_name, filter: params.filter });
      if (params.start_date) q.set('start_date', params.start_date);
      if (params.end_date) q.set('end_date', params.end_date);
      return request<{
        stage_name: string;
        count: number;
        start_date: string;
        end_date: string;
      }>(`/api/stage-counts?${q.toString()}`);
    },
  },
};
