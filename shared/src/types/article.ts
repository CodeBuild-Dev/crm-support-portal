export interface Article {
  id: string;
  folderId: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  author?: string;
  sortOrder: number;
  isPublished: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleInput {
  folderId: string;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  author?: string;
  sortOrder?: number;
}

export interface UpdateArticleInput {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  author?: string;
  sortOrder?: number;
  isPublished?: boolean;
}

// Computed fields (never stored)
export interface ArticleWithContext extends Article {
  folder: import('./folder').Folder;
  category: import('./category').Category;
  readingTimeMinutes: number;
}
