export function getSafeRedirect(next: string | null, fallback = "/espace/emprunts"): string {
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
