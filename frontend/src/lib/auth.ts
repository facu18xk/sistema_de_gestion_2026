import { toSessionUser, resolveUserRole } from "@/config/user-roles";
import type { AuthUser, User, UserRole } from "@/types/types";

const USER_STORAGE_KEY = "user";

export function normalizeRole(role: unknown, email?: string): UserRole {
  if (role === "ADMIN") return "ADMIN";
  if (role === "USER") return "USER";
  if (email) return resolveUserRole(email);
  return "USER";
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const authUser: AuthUser = {
      id: String(parsed.id ?? ""),
      firstName: String(parsed.firstName ?? ""),
      lastName: String(parsed.lastName ?? ""),
      email: String(parsed.email ?? ""),
    };

    return {
      ...authUser,
      role: normalizeRole(parsed.role, authUser.email),
    };
  } catch {
    return null;
  }
}

export function saveSessionUser(authUser: AuthUser): User {
  const user = toSessionUser(authUser);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function getUserDisplayName(user: User | null): string {
  if (!user) return "Usuario";
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || user.email;
}
