export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, 'email'>;
