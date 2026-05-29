import type { AuthUser, User, UserRole } from "@/types/types";

/**
 * Correos con rol ADMIN (solo frontend).
 * También puedes definir NEXT_PUBLIC_ADMIN_EMAILS=admin@a.com,otro@b.com
 */
const DEFAULT_ADMIN_EMAILS = ["admin@mcqueentires.com"];

function getAdminEmails(): string[] {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  if (!fromEnv?.trim()) return DEFAULT_ADMIN_EMAILS;

  return fromEnv
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveUserRole(email: string): UserRole {
  const normalized = email.trim().toLowerCase();
  if (getAdminEmails().includes(normalized)) return "ADMIN";
  return "USER";
}

export function toSessionUser(authUser: AuthUser): User {
  return {
    ...authUser,
    role: resolveUserRole(authUser.email),
  };
}
