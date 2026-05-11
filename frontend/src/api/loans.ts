import { apiConfig } from "@/lib/env";
import type { Loan, LoanInput } from "@/types/loan";
import { requestJson } from "./http";

const base = apiConfig.loans;

export function createLoan(payload: LoanInput): Promise<{ status: string; loan: Loan }> {
  return requestJson<{ status: string; loan: Loan }>(`${base}/loans`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getUserLoans(userId: number): Promise<Loan[]> {
  return requestJson<Loan[]>(`${base}/loans/user/${userId}`);
}

export function getLoanHistory(): Promise<Loan[]> {
  return requestJson<Loan[]>(`${base}/loans/history`);
}

export function returnLoan(userId: number, bookId: number): Promise<Loan> {
  return requestJson<Loan>(`${base}/loans/return`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, book_id: bookId }),
  });
}
