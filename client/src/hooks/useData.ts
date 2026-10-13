/**
 * React Query hooks for the help center and admin data.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ---- Public hooks (used by pages) ----

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: api.categories.list,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => api.categories.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.articles.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useSearchArticles(query: string, limit = 10) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.articles.search(query, limit),
    enabled: query.length >= 2,
  });
}

export function usePopularArticles(limit = 12) {
  return useQuery({
    queryKey: ['popular-articles'],
    queryFn: () => api.articles.popular(limit),
  });
}

// ---- Vote / View (fire-and-forget) ----

export function useVoteArticle() {
  return useMutation({
    mutationFn: ({ id, helpful }: { id: string; helpful: boolean }) =>
      api.articles.vote(id, helpful).catch(() => {}),
  });
}

export function useViewArticle() {
  return useMutation({
    mutationFn: (id: string) => api.articles.view(id).catch(() => {}),
  });
}

// ---- Admin hooks ----

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.categories.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.categories.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.folders.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.folders.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.articles.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.articles.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['article'] });
      qc.invalidateQueries({ queryKey: ['article-versions'] });
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.articles.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useArticleVersions(articleId: string | null) {
  return useQuery({
    queryKey: ['article-versions', articleId],
    queryFn: () => api.articles.getVersions(articleId!),
    enabled: !!articleId,
  });
}

export function useRestoreVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versionId }: { id: string; versionId: string }) =>
      api.articles.restoreVersion(id, versionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['article'] });
      qc.invalidateQueries({ queryKey: ['article-versions'] });
    },
  });
}

// ---- Analytics ----

export function useAnalyticsOverview() {
  return useQuery({ queryKey: ['analytics-overview'], queryFn: api.analytics.overview });
}

export function useTopArticles(limit = 10) {
  return useQuery({ queryKey: ['analytics-top-articles'], queryFn: () => api.analytics.topArticles(limit) });
}

export function useTopSearches(limit = 20) {
  return useQuery({ queryKey: ['analytics-top-searches'], queryFn: () => api.analytics.topSearches(limit) });
}

// ---- Tickets ----

export function useTickets(status?: 'open' | 'in_progress' | 'closed') {
  return useQuery({ queryKey: ['tickets', status ?? 'all'], queryFn: () => api.tickets.list(status) });
}

export function useTicketStats() {
  return useQuery({
    queryKey: ['tickets-stats'],
    queryFn: api.tickets.stats,
    // Poll every 30s so the admin bell picks up newly-raised tickets
    refetchInterval: 30_000,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.tickets.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets-stats'] });
    },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; priority?: string; adminNotes?: string } }) =>
      api.tickets.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets-stats'] });
    },
  });
}

// ---- AI Settings ----

export function usePublicAiSettings() {
  return useQuery({
    queryKey: ['ai-settings-public'],
    queryFn: api.aiSettings.getPublic,
    // Tolerate failure (backend may not be reachable / configured)
    retry: false,
  });
}

export function useAdminAiSettings() {
  return useQuery({ queryKey: ['ai-settings-admin'], queryFn: api.aiSettings.getAdmin });
}

export function useUpdateAiSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.aiSettings.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-settings-public'] });
      qc.invalidateQueries({ queryKey: ['ai-settings-admin'] });
    },
  });
}

// ---- Email Settings ----

export function useEmailSettings() {
  return useQuery({ queryKey: ['email-settings'], queryFn: api.emailSettings.get });
}

export function useUpdateEmailSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.emailSettings.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-settings'] }),
  });
}
