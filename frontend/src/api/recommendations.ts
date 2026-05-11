import { apiConfig } from "@/lib/env";
import type { Book } from "@/types/book";
import { requestJson } from "./http";

const base = apiConfig.reco;

export function getRecommendations(userId: number): Promise<Book[]> {
  return requestJson<Book[]>(`${base}/recommendations/${userId}`);
}
