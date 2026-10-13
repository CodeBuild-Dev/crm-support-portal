export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  performedAt: Date;
}

export const AUDIT_ACTIONS = {
  CATEGORY_CREATE: 'category.create',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',
  FOLDER_CREATE: 'folder.create',
  FOLDER_UPDATE: 'folder.update',
  FOLDER_DELETE: 'folder.delete',
  ARTICLE_CREATE: 'article.create',
  ARTICLE_UPDATE: 'article.update',
  ARTICLE_DELETE: 'article.delete',
  ARTICLE_PUBLISH: 'article.publish',
  ARTICLE_UNPUBLISH: 'article.unpublish',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
} as const;
