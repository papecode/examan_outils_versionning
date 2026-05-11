export type LoanStatus = "actif" | "retourne" | "en_retard";

export interface Loan {
  user_id: number;
  book_id: number;
  date_emprunt?: string;
  date_retour?: string;
  statut?: LoanStatus;
}

export interface LoanInput {
  user_id: number;
  book_id: number;
}
