import { apiConfig } from "@/lib/env";
import type { Book, BookInput } from "@/types/book";
import { requestJson } from "./http";

const base = apiConfig.books;

export function listBooks(): Promise<Book[]> {
  return requestJson<Book[]>(`${base}/books`);
}

export function searchBooks(query: string): Promise<Book[]> {
  const params = new URLSearchParams({ q: query });
  return requestJson<Book[]>(`${base}/search?${params.toString()}`);
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
