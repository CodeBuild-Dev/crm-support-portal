/**
 * Create a login account for the admin panel.
 * Usage: pnpm create-user <email> <password> [role] [display name]
 *   role: super_admin | admin | editor | viewer (default: admin)
 */
import type { UserRole } from 'shared';
import { authService } from '../services/auth.service.js';

const ROLES: UserRole[] = ['super_admin', 'admin', 'editor', 'viewer'];

async function main() {
  const [email, password, role = 'admin', ...nameParts] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage: pnpm create-user <email> <password> [role] [display name]');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('Password must be at least 12 characters');
    process.exit(1);
  }
  if (!ROLES.includes(role as UserRole)) {
    console.error(`Role must be one of: ${ROLES.join(', ')}`);
    process.exit(1);
  }

  const user = await authService.createUser({
    email,
    password,
    role: role as UserRole,
    displayName: nameParts.join(' ') || email.split('@')[0],
  });
  console.log(`Created ${user.role} ${user.email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to create user:', err.message);
  process.exit(1);
});
