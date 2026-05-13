import { DEFAULT_PAGE_SIZE, type PaginatedResponse, type PaginationParams } from "@/types/pagination";

export function normalizePage(page?: number): number {
  if (!page || page < 1 || !Number.isFinite(page)) {
    return 1;
  }
  return Math.floor(page);
}

export function normalizePageSize(pageSize?: number): number {
  if (!pageSize || pageSize < 1 || !Number.isFinite(pageSize)) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.floor(pageSize);
}

export function paginateArray<T>(
  items: T[],
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): PaginatedResponse<T> {
  const safePage = normalizePage(page);
  const safePageSize = normalizePageSize(pageSize);
  const total = items.length;
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    total,
    page: safePage,
    pageSize: safePageSize,
  };
}

export function isPaginatedResponse<T>(value: unknown): value is PaginatedResponse<T> {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as PaginatedResponse<T>;
  return Array.isArray(candidate.items) && typeof candidate.total === "number";
}

export function toPaginatedResponse<T>(
  value: T[] | PaginatedResponse<T>,
  params: PaginationParams = {},
): PaginatedResponse<T> {
  if (isPaginatedResponse<T>(value)) {
    return value;
  }
  return paginateArray(value, params.page ?? 1, params.pageSize ?? DEFAULT_PAGE_SIZE);
}

export function buildPaginationQuery(params: PaginationParams): string {
  const search = new URLSearchParams();
  if (params.page) {
    search.set("page", String(normalizePage(params.page)));
  }
  if (params.pageSize) {
    search.set("pageSize", String(normalizePageSize(params.pageSize)));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function getTotalPages(total: number, pageSize: number): number {
  if (total <= 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(total / normalizePageSize(pageSize)));
}
