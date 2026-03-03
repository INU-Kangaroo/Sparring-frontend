import * as AuthSession from "expo-auth-session";
import { post } from "./index";
import { setTokensToStorage } from "../utils/asyncStorage";

export type OAuthProvider = "kakao" | "google";

export type OAuthJwtResponse = {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  [key: string]: any;
};

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "";

export function getAuthorizationEndpoint(provider: OAuthProvider) {
  if (!BACKEND_URL) throw new Error("BACKEND URL 환경변수가 필요합니다.");
  return `${BACKEND_URL}/oauth2/authorization/${provider}`;
}

export function makeRedirectUri() {
  return AuthSession.makeRedirectUri({ useProxy: true });
}

// 명세: POST /api/auth/oauth2/{provider}
export async function exchangeOAuthCode(args: {
  provider: OAuthProvider;
  code: string;
  redirectUri: string;
}) {
  const res = await post<OAuthJwtResponse>(`/api/auth/oauth2/${args.provider}`, {
    code: args.code,
    redirectUri: args.redirectUri,
  });
  return res.data?.data ?? res.data;
}

// 명세: POST /api/auth/social/complete (필요하면 여기서 추가 정보 제출)
export async function completeSocialSignup(payload: Record<string, any>) {
  const res = await post<any>("/api/auth/social/complete", payload);
  return res.data?.data ?? res.data;
}

export async function saveTokensFromOAuth(payload: OAuthJwtResponse) {
  const accessToken = payload.accessToken ?? payload.token;
  if (!accessToken) throw new Error("OAuth 응답에 accessToken/token이 없습니다.");
  await setTokensToStorage(accessToken, payload.refreshToken);
  return accessToken;
}