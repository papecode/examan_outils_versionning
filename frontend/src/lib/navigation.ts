import { getDefaultDashboardPath } from "@/lib/roles";
import type { User } from "@/types/user";

export function getSafeRedirect(next: string | null, user?: User | null): string {
  const fallback = getDefaultDashboardPath(user);
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

export function buildLoginUrl(nextPath: string, bookId?: number): string {
  const params = new URLSearchParams({ next: nextPath });
  if (bookId) {
    params.set("bookId", String(bookId));
  }
  return `/connexion?${params.toString()}`;
}
