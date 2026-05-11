const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${key}`);
  }
  return value;
};

export const apiConfig = {
  users: import.meta.env.VITE_API_USERS_URL ?? "http://localhost:8000",
  books: import.meta.env.VITE_API_BOOKS_URL ?? "http://localhost:8001",
  loans: import.meta.env.VITE_API_LOANS_URL ?? "http://localhost:8003",
  reco: import.meta.env.VITE_API_RECO_URL ?? "http://localhost:8004",
};

export function assertApiConfig(): void {
  required(apiConfig.users, "VITE_API_USERS_URL");
  required(apiConfig.books, "VITE_API_BOOKS_URL");
  required(apiConfig.loans, "VITE_API_LOANS_URL");
  required(apiConfig.reco, "VITE_API_RECO_URL");
}
