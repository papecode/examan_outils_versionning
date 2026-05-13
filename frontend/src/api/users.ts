import { buildPaginationQuery, toPaginatedResponse } from "@/lib/pagination";
import { apiConfig } from "@/lib/env";
import type { User, UserInput } from "@/types/user";
import type { PaginatedResponse, PaginationParams } from "@/types/pagination";
import { requestJson } from "./http";

const base = apiConfig.users;

export function createUser(payload: UserInput): Promise<User> {
  return requestJson<User>(`${base}/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listUsers(params: PaginationParams = {}): Promise<PaginatedResponse<User>> {
  const response = await requestJson<User[] | PaginatedResponse<User>>(
    `${base}/users${buildPaginationQuery(params)}`,
  );
  return toPaginatedResponse(response, params);
}

export function getUserById(userId: number): Promise<User> {
  return requestJson<User>(`${base}/users/${userId}`);
}
