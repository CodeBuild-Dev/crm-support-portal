export interface Folder {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFolderInput {
  categoryId: string;
  title: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateFolderInput {
  title?: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isPublished?: boolean;
}
