import axios from "axios";
import type { UserSession } from "@/models/Users";
import type { AuthApiResponse } from "@/lib/auth/types";

const backendAuthClient = axios.create({
  baseURL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL,
});

export async function registerGoogleUser(
  payload: UserSession
): Promise<AuthApiResponse> {
  const { data } = await backendAuthClient.post<AuthApiResponse>(
    "/auth",
    payload
  );
  return data;
}

export async function registerGuestUser(input: {
  username: string;
  skin?: string;
  avatar?: string;
}): Promise<AuthApiResponse> {
  const { data } = await backendAuthClient.post<AuthApiResponse>(
    "/auth/guest",
    input
  );
  return data;
}
