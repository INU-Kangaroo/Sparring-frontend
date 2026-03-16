import { useCallback, useState } from "react";
import { login } from "@react-native-seoul/kakao-login";
import { loginWithKakaoSdk } from "../app/api/kakao";
import type { OAuthJwtResponse } from "../app/api/oauth";

export function useKakaoLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithKakao = useCallback(async (): Promise<OAuthJwtResponse> => {
    setIsLoading(true);

    try {
      console.log("카카오 로그인 시작");

      const token = await login();
      console.log("카카오 SDK 응답:", token);

      if (!token?.accessToken) {
        throw new Error("카카오 accessToken을 받지 못했습니다.");
      }

      const jwtPayload = await loginWithKakaoSdk({
        accessToken: token.accessToken,
      });

      console.log("백엔드 카카오 로그인 응답:", jwtPayload);
      return jwtPayload;
    } catch (e) {
      console.log("카카오 로그인 에러:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login: loginWithKakao,
    isLoading,
    disabled: isLoading,
  };
}