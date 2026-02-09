// app/api/kakaoOuth.ts
import * as AuthSession from "expo-auth-session";
import { post } from "./index";
import { setTokenToStorage } from "../utils/asyncStorage";

type KakaoLoginResponse = {
  accessToken: string;
  refreshToken?: string;
  [key: string]: any;
};

type SuccessResult = AuthSession.AuthSessionResult & {
  type: "success";
  params: Record<string, string>;
};

function isSuccessResult(r: AuthSession.AuthSessionResult): r is SuccessResult {
  return r.type === "success" && typeof (r as any).params === "object" && (r as any).params !== null;
}

export async function signInWithKakao(): Promise<KakaoLoginResponse> {
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  const clientId = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID;
  if (!clientId) throw new Error("EXPO_PUBLIC_KAKAO_CLIENT_ID 누락");

  const authUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code`;

  const result = await AuthSession.startAsync({ authUrl });

  if (!isSuccessResult(result)) {
    throw new Error("카카오 로그인 취소/실패");
  }

  const code = result.params.code;
  if (!code) throw new Error("카카오 authorization code 누락");

  const res = await post<KakaoLoginResponse>("/api/auth/oauth2/kakao", {
    code,
    redirectUri,
  });

  if (!res.data?.accessToken) {
    throw new Error("백엔드 응답에 accessToken이 없습니다.");
  }

  await setTokenToStorage(res.data.accessToken);
  return res.data;
}
