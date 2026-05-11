export type UserRole = "Etudiant" | "Professeur" | "Personnel";

export interface User {
  id: number;
  nom: string;
  email: string;
  type_utilisateur: string;
}

export interface UserInput {
  nom: string;
  type_utilisateur: string;
  email?: string;
}
