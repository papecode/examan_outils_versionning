import type { Loan } from "@/types/loan";

const DEFAULT_LOAN_DURATION_DAYS = 7;

export function formatLoanDate(value?: string): string {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString("fr-FR");
}

export function getLoanDueDate(loan: Loan): string | undefined {
  if (loan.date_echeance) {
    return loan.date_echeance;
  }
  if (!loan.date_emprunt) {
    return undefined;
  }
  const dueDate = new Date(loan.date_emprunt);
  dueDate.setDate(dueDate.getDate() + DEFAULT_LOAN_DURATION_DAYS);
  return dueDate.toISOString();
}

export function formatLoanDueDate(loan: Loan): string {
  return formatLoanDate(getLoanDueDate(loan));
}

export function getLoanStatusLabel(loan: Loan): string {
  if (loan.statut === "en_retard") {
    return "En retard";
  }
  if (loan.statut === "retourne" || loan.date_retour) {
    return "Retourne";
  }
  return "Actif";
}

export function isLoanOverdue(loan: Loan): boolean {
  return loan.statut === "en_retard";
}

export function isLoanActive(loan: Loan): boolean {
  return loan.statut !== "retourne" && !loan.date_retour;
}
