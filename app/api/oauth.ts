import { post } from "./index";
import { setTokensToStorage } from "../utils/asyncStorage";

export type OAuthProvider = "google" | "kakao";

export type OAuthJwtResponse = {
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

function getOAuthEndpoint(provider: OAuthProvider, hasCodeVerifier?: boolean) {
  if (provider === "google") {
    return hasCodeVerifier
      ? "/api/auth/oauth2/google/pkce"
      : "/api/auth/oauth2/google/sdk";
  }

  return `/api/auth/oauth2/${provider}`;
}

export async function exchangeOAuthCode(args: {
  provider: OAuthProvider;
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}): Promise<OAuthJwtResponse> {
  const { provider, code, redirectUri, codeVerifier } = args;

  const endpoint = getOAuthEndpoint(provider, !!codeVerifier);

  const body =
    provider === "google" && codeVerifier
      ? {
          authorizationCode: code,
          redirectUri,
          codeVerifier,
        }
      : {
          code,
          redirectUri,
          ...(codeVerifier ? { codeVerifier } : {}),
        };

  console.log("[exchangeOAuthCode] endpoint =", endpoint);
  console.log("[exchangeOAuthCode] body =", JSON.stringify(body, null, 2));

  try {
    const res = await post<OAuthJwtResponse>(endpoint, body);
    console.log("[exchangeOAuthCode] response =", res?.data ?? res);
    return unwrapApi<OAuthJwtResponse>(res);
  } catch (e: any) {
    console.log("[exchangeOAuthCode] error message =", e?.message);
    console.log("[exchangeOAuthCode] error code =", e?.code);
    console.log("[exchangeOAuthCode] error status =", e?.response?.status);
    console.log("[exchangeOAuthCode] error data =", e?.response?.data);
    throw e;
  }
}

export async function saveTokensFromOAuth(payload: OAuthJwtResponse) {
  const accessToken = payload.accessToken ?? payload.token;
  const refreshToken = payload.refreshToken;

  if (!accessToken) {
    throw new Error("OAuth 응답에 accessToken/token이 없습니다.");
  }

  if (!refreshToken) {
    throw new Error("OAuth 응답에 refreshToken이 없습니다.");
  }

  await setTokensToStorage(accessToken, refreshToken);
  return { accessToken, refreshToken };
}