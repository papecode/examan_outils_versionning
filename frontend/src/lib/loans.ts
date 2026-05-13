import type { Loan } from "@/types/loan";

export function formatLoanDate(value?: string): string {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString("fr-FR");
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
