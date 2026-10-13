export interface Category {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryInput {
  title: string;
  slug?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  title?: string;
  slug?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isPublished?: boolean;
}
