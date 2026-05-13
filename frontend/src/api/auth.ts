import { apiConfig } from "@/lib/env";
import type { User } from "@/types/user";
import { requestJson } from "./http";

const base = apiConfig.users;

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

function normalizeLoginResponse(payload: User | LoginResponse): LoginResponse {
  if ("user" in payload) {
    return payload;
  }
  return { user: payload };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await requestJson<User | LoginResponse>(`${base}/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeLoginResponse(response);
}

export function requestPasswordReset(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
  return requestJson<ForgotPasswordResponse>(`${base}/auth/forgot-password`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
