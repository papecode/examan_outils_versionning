import { buildPaginationQuery, toPaginatedResponse } from "@/lib/pagination";
import { apiConfig } from "@/lib/env";
import type { Book, BookInput } from "@/types/book";
import type { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { requestJson } from "./http";

const base = apiConfig.books;

export async function listBooks(params: PaginationParams = {}): Promise<PaginatedResponse<Book>> {
  const response = await requestJson<Book[] | PaginatedResponse<Book>>(
    `${base}/books${buildPaginationQuery(params)}`,
  );
  return toPaginatedResponse(response, params);
}

export async function searchBooks(
  query: string,
  params: PaginationParams = {},
): Promise<PaginatedResponse<Book>> {
  const search = new URLSearchParams({ q: query });
  if (params.page) {
    search.set("page", String(params.page));
  }
  if (params.pageSize) {
    search.set("pageSize", String(params.pageSize));
  }
  const response = await requestJson<Book[] | PaginatedResponse<Book>>(
    `${base}/search?${search.toString()}`,
  );
  return toPaginatedResponse(response, params);
}

export function createBook(payload: BookInput): Promise<Book> {
  return requestJson<Book>(`${base}/books`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBook(bookId: number, payload: BookInput): Promise<Book> {
  return requestJson<Book>(`${base}/books/${bookId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteBook(bookId: number): Promise<void> {
  return requestJson<void>(`${base}/books/${bookId}`, { method: "DELETE" });
}
