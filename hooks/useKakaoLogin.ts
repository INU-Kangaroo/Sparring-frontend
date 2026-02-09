import * as AuthSession from "expo-auth-session";
import { useMemo, useState } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import { exchangeKakaoCode, type KakaoJwtResponse } from "../app/api/kakaoOuth";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL ?? "";

const saveToken = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
    return;
  }
    (globalThis as any).__authTokens = {
    ...(globalThis as any).__authTokens,
    [key]: value,
  };
};

export function useKakaoLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const redirectUri = useMemo(
    () => AuthSession.makeRedirectUri({ scheme: "kangaroo", path: "oauth" }),
    []
  );

  const discovery = useMemo(
    () => ({
      authorizationEndpoint: `${BACKEND_URL}/oauth2/authorization/kakao`,
    }),
    []
  );

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: "kakao",
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: false,
    },
    discovery
  );
    const login = async (): Promise<KakaoJwtResponse> => {
    if (!BACKEND_URL) {
      throw new Error("EXPO_PUBLIC_BACKEND_URL 또는 BACKEND_URL 환경변수가 필요합니다.");
    }
    setIsLoading(true);

    try {
      const result = await promptAsync();

      if (result.type !== "success") {
        throw new Error("카카오 인증이 취소되었거나 실패했습니다.");
      }

      const code = result.params?.code;
      if (!code) {
        throw new Error("카카오 authorization code를 받지 못했습니다.");
      }

      const tokenPayload = await exchangeKakaoCode({
        code,
        redirectUri,
      });

      const accessToken = tokenPayload.accessToken ?? tokenPayload.token;
      if (!accessToken) {
        throw new Error("응답에 accessToken/token 값이 없습니다.");
      }

      await saveToken("accessToken", accessToken);

      if (tokenPayload.refreshToken) {
        await saveToken("refreshToken", tokenPayload.refreshToken);
      }

      router.replace("/main/main");
      return tokenPayload;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    disabled: !request || isLoading,
    isLoading,
  };
} 