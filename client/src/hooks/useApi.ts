import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ---- Categories ----
export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: api.categories.list });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => api.categories.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.categories.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.categories.update(id, data),
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

// ---- Folders ----
export function useFoldersByCategory(categoryId: string | null) {
  return useQuery({
    queryKey: ['folders', categoryId],
    queryFn: () => api.folders.listByCategory(categoryId!),
    enabled: !!categoryId,
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.folders.create,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['folders', vars.categoryId] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.folders.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['folders'] }),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.folders.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['folders'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// ---- Articles ----
export function useArticlesByFolder(folderId: string | null, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['articles', folderId, page],
    queryFn: () => api.articles.listByFolder(folderId!, page, limit),
    enabled: !!folderId,
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

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.articles.create,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['articles', vars.folderId] });
      qc.invalidateQueries({ queryKey: ['folders'] });
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
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.articles.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['folders'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useVoteArticle() {
  return useMutation({
    mutationFn: ({ id, helpful }: { id: string; helpful: boolean }) => api.articles.vote(id, helpful),
  });
}

export function useViewArticle() {
  return useMutation({
    mutationFn: (id: string) => api.articles.view(id),
  });
}

export function useArticleVersions(articleId: string | null) {
  return useQuery({
    queryKey: ['article-versions', articleId],
    queryFn: () => api.articles.getVersions(articleId!),
    enabled: !!articleId,
  });
}

export function useRestoreArticleVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, versionId }: { id: string; versionId: string }) => api.articles.restoreVersion(id, versionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['articles'] });
      qc.invalidateQueries({ queryKey: ['article'] });
      qc.invalidateQueries({ queryKey: ['article-versions'] });
    },
  });
}

export function useReorderArticles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.articles.reorder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }),
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

export function useZeroResultSearches(limit = 20) {
  return useQuery({ queryKey: ['analytics-zero-results'], queryFn: () => api.analytics.zeroResults(limit) });
}
