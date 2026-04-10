import { post } from "./index";
import { setTokensToStorage } from "../utils/asyncStorage";

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

export type GooglePeopleProfile = {
  nickname: string;
  displayName: string;
  birthday: {
    year?: number;
    month?: number;
    day?: number;
  } | null;
  gender: string;
  raw: any;
};

function unwrapApi<T>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

function getGoogleOAuthEndpoint(hasCodeVerifier?: boolean) {
  return hasCodeVerifier
    ? "/api/auth/oauth2/google/pkce"
    : "/api/auth/oauth2/google/sdk";
}

export async function exchangeGoogleOAuthCode(args: {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}): Promise<OAuthJwtResponse> {
  const { code, redirectUri, codeVerifier } = args;

  const endpoint = getGoogleOAuthEndpoint(!!codeVerifier);

  const body = codeVerifier
    ? {
        authorizationCode: code,
        redirectUri,
        codeVerifier,
      }
    : {
        code,
        redirectUri,
      };

  console.log("[exchangeGoogleOAuthCode] endpoint =", endpoint);
  console.log(
    "[exchangeGoogleOAuthCode] body =",
    JSON.stringify(body, null, 2)
  );

  try {
    const res = await post<OAuthJwtResponse>(endpoint, body);
    console.log("[exchangeGoogleOAuthCode] response =", res?.data ?? res);
    return unwrapApi<OAuthJwtResponse>(res);
  } catch (e: any) {
    console.log("[exchangeGoogleOAuthCode] error message =", e?.message);
    console.log("[exchangeGoogleOAuthCode] error code =", e?.code);
    console.log("[exchangeGoogleOAuthCode] error status =", e?.response?.status);
    console.log("[exchangeGoogleOAuthCode] error data =", e?.response?.data);
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

export async function fetchGooglePeopleProfile(
  googleAccessToken: string
): Promise<GooglePeopleProfile> {
  const url =
    "https://people.googleapis.com/v1/people/me" +
    "?personFields=names,nicknames,birthdays,genders";

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${googleAccessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.log("[GOOGLE PEOPLE] error status =", res.status);
    console.log("[GOOGLE PEOPLE] error body =", text);
    throw new Error(`Google People API 요청 실패: ${res.status}`);
  }

  const raw = await res.json();

  const nickname =
    raw?.nicknames?.find((x: any) => x?.value)?.value ??
    raw?.names?.find((x: any) => x?.displayName)?.displayName ??
    "";

  const birthdayEntry = raw?.birthdays?.find((x: any) => x?.date)?.date;
  const gender = raw?.genders?.find((x: any) => x?.value)?.value ?? "";

  return {
    nickname,
    displayName:
      raw?.names?.find((x: any) => x?.displayName)?.displayName ?? "",
    birthday: birthdayEntry
      ? {
          year: birthdayEntry.year,
          month: birthdayEntry.month,
          day: birthdayEntry.day,
        }
      : null,
    gender,
    raw,
  };
}