import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, sql } from 'drizzle-orm';
import { db, userProfiles } from 'drizzle';
import type { UserRole } from 'shared';
import { config } from '../config.js';

const BCRYPT_ROUNDS = 12;

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

interface TokenPayload {
  sub: string;
}

function toAuthUser(row: typeof userProfiles.$inferSelect): AuthUser {
  return {
    id: row.id,
    email: row.email ?? '',
    displayName: row.displayName,
    role: row.role as UserRole,
  };
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Compared against when the email is unknown, so response time doesn't
// reveal whether an account exists.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hash('not-a-real-password', BCRYPT_ROUNDS));

export const authService = {
  hashPassword(password: string) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  },

  signToken(userId: string) {
    return jwt.sign({ sub: userId } satisfies TokenPayload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
  },

  verifyToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      return typeof payload === 'object' && typeof payload.sub === 'string' ? { sub: payload.sub } : null;
    } catch {
      return null;
    }
  },

  /** Returns the user when the credentials are valid and the account is active. */
  async login(email: string, password: string): Promise<AuthUser | null> {
    const [user] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.email, normalizeEmail(email)))
      .limit(1);

    const valid = await bcrypt.compare(password, user?.passwordHash ?? (await getDummyHash()));
    if (!user || !user.passwordHash || !valid || !user.isActive) return null;

    await db.update(userProfiles).set({ lastLoginAt: new Date() }).where(eq(userProfiles.id, user.id));
    return toAuthUser(user);
  },

  async getActiveUser(id: string): Promise<AuthUser | null> {
    const [user] = await db.select().from(userProfiles).where(eq(userProfiles.id, id)).limit(1);
    if (!user || !user.isActive || !user.email) return null;
    return toAuthUser(user);
  },

  async createUser(input: { email: string; password: string; displayName: string; role: UserRole }) {
    const [user] = await db
      .insert(userProfiles)
      .values({
        email: normalizeEmail(input.email),
        passwordHash: await this.hashPassword(input.password),
        displayName: input.displayName,
        role: input.role,
      })
      .returning();
    return toAuthUser(user);
  },

  /**
   * Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD when no login
   * accounts exist yet. Safe to call on every boot.
   */
  async ensureBootstrapAdmin() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;

    if (password.length < 12) {
      console.warn('[auth] ADMIN_PASSWORD must be at least 12 characters — bootstrap admin not created');
      return;
    }

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(userProfiles)
      .where(sql`${userProfiles.email} IS NOT NULL`);
    if (total > 0) return;

    await this.createUser({ email, password, displayName: 'Administrator', role: 'super_admin' });
    console.log(`[auth] Created bootstrap admin ${normalizeEmail(email)}`);
  },
};
