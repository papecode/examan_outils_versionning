import { apiConfig } from "@/lib/env";
import type { User, UserInput } from "@/types/user";
import { requestJson } from "./http";

const base = apiConfig.users;

export function checkUser(identifier: string): Promise<User> {
  return requestJson<User>(`${base}/users/check/${encodeURIComponent(identifier)}`);
}

export function createUser(payload: UserInput): Promise<User> {
  return requestJson<User>(`${base}/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listUsers(): Promise<User[]> {
  return requestJson<User[]>(`${base}/users`);
}

export function getUserById(userId: number): Promise<User> {
  return requestJson<User>(`${base}/users/${userId}`);
}
