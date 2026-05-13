import type { User } from "@/types/user";

export function isStaff(user: User | null | undefined): boolean {
  return user?.type_utilisateur === "Personnel";
}
