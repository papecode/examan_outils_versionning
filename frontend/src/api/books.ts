import { buildPaginationQuery, toPaginatedResponse } from "@/lib/pagination";
import { apiConfig } from "@/lib/env";
import type { Book, BookInput } from "@/types/book";
import type { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { requestJson } from "./http";

const base = apiConfig.books;

export interface BookQueryParams extends PaginationParams {
  categorie?: string;
  auteur?: string;
}

export interface BookFacets {
  categories: string[];
  authors: string[];
}

function buildBookQuery(params: BookQueryParams = {}): string {
  const search = new URLSearchParams(buildPaginationQuery(params).replace(/^\?/, ""));
  if (params.categorie) {
    search.set("categorie", params.categorie);
  }
  if (params.auteur) {
    search.set("auteur", params.auteur);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function getBookFacets(): Promise<BookFacets> {
  return requestJson<BookFacets>(`${base}/books/facets`);
}

export async function listBooks(params: BookQueryParams = {}): Promise<PaginatedResponse<Book>> {
  const response = await requestJson<Book[] | PaginatedResponse<Book>>(
    `${base}/books${buildBookQuery(params)}`,
  );
  return toPaginatedResponse(response, params);
}

export async function searchBooks(
  query: string,
  params: BookQueryParams = {},
): Promise<PaginatedResponse<Book>> {
  const search = new URLSearchParams({ q: query });
  if (params.page) {
    search.set("page", String(params.page));
  }
  if (params.pageSize) {
    search.set("pageSize", String(params.pageSize));
  }
  if (params.categorie) {
    search.set("categorie", params.categorie);
  }
  if (params.auteur) {
    search.set("auteur", params.auteur);
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
