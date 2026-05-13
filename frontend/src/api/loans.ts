import { buildPaginationQuery, toPaginatedResponse } from "@/lib/pagination";
import { apiConfig } from "@/lib/env";
import type { Loan, LoanInput } from "@/types/loan";
import type { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { requestJson } from "./http";

const base = apiConfig.loans;

export interface LoanStats {
  total: number;
  active: number;
  overdue: number;
}

export function getLoanStats(): Promise<LoanStats> {
  return requestJson<LoanStats>(`${base}/loans/stats`);
}

export function createLoan(payload: LoanInput): Promise<{ status: string; loan: Loan }> {
  return requestJson<{ status: string; loan: Loan }>(`${base}/loans`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getUserLoans(
  userId: number,
  params: PaginationParams = {},
): Promise<PaginatedResponse<Loan>> {
  const response = await requestJson<Loan[] | PaginatedResponse<Loan>>(
    `${base}/loans/user/${userId}${buildPaginationQuery(params)}`,
  );
  return toPaginatedResponse(response, params);
}

export async function getLoanHistory(
  params: PaginationParams = {},
): Promise<PaginatedResponse<Loan>> {
  const response = await requestJson<Loan[] | PaginatedResponse<Loan>>(
    `${base}/loans/history${buildPaginationQuery(params)}`,
  );
  return toPaginatedResponse(response, params);
}

export function returnLoan(userId: number, bookId: number): Promise<Loan> {
  return requestJson<Loan>(`${base}/loans/return`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, book_id: bookId }),
  });
}
