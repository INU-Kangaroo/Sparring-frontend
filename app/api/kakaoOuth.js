import * as AuthSession from "expo-auth-session";
import { post } from "./index";
import { setTokenToStorage } from "../utils/asyncStorage";

export async function signInWithKakao() {
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  const clientId = process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID; 
  if (!clientId) throw new Error("EXPO_PUBLIC_KAKAO_CLIENT_ID 누락");

  const authUrl =
    `https://kauth.kakao.com/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code`;

  const result = await AuthSession.startAsync({ authUrl });

  if (result.type !== "success" || !result.params?.code) {
    throw new Error("카카오 로그인 취소/실패");
  }

  const code = result.params.code;

  // 백엔드가 code를 받아 JWT 발급
  const res = await post(`/api/auth/oauth2/kakao`, { code, redirectUri });

  // 응답 형식에 맞춰 토큰 저장
  // 예: { accessToken: "...", refreshToken: "..." }
  await setTokenToStorage(res.data.accessToken);

  return res.data;
}
