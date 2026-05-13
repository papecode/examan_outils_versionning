import type { User } from "@/types/user";

export function isStaff(user: User | null | undefined): boolean {
  return user?.type_utilisateur === "Personnel";
}

export function isStudent(user: User | null | undefined): boolean {
  return user?.type_utilisateur === "Etudiant";
}

export function isProfessor(user: User | null | undefined): boolean {
  return user?.type_utilisateur === "Professeur";
}

export function getDefaultDashboardPath(user: User | null | undefined): string {
  if (isStaff(user)) {
    return "/espace/personnel";
  }
  if (isProfessor(user)) {
    return "/espace/professeur";
  }
  return "/espace/etudiant";
}
