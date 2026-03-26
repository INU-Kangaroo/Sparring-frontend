import { post } from "./index";
import { setTokensToStorage } from "../utils/asyncStorage";

export type AppleLoginRequest = {
  identityToken: string;
  authorizationCode: string;
  user: string;
  email?: string | null;
  fullName?: string | null;
};

export type AppleJwtResponse = {
  userId?: number;
  email?: string;
  username?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  token?: string;
  [key: string]: any;
};

function unwrapApi<T>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

export async function loginWithApple(payload: AppleLoginRequest) {
  const res = await post<AppleJwtResponse>("/api/auth/oauth2/apple", payload);
  return unwrapApi<AppleJwtResponse>(res);
}

export async function saveTokensFromApple(payload: AppleJwtResponse) {
  const accessToken = payload.accessToken ?? payload.token;
  const refreshToken = payload.refreshToken;

  if (!accessToken) {
    throw new Error("Apple 로그인 응답에 accessToken/token이 없습니다.");
  }
  if (!refreshToken) {
    throw new Error("Apple 로그인 응답에 refreshToken이 없습니다.");
  }

  await setTokensToStorage(accessToken, refreshToken);
  return { accessToken, refreshToken };
}