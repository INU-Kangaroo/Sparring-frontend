import { useCallback, useState } from "react";
import { Alert } from "react-native";
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

      // accessToken만 백엔드에 전달
      const jwtPayload = await loginWithKakaoSdk({
        accessToken: token.accessToken,
      });

      console.log("백엔드 카카오 로그인 응답:", jwtPayload);
      return jwtPayload;
    } catch (e: any) {
      const status = e?.response?.status;
      const code = e?.response?.data?.code;
      const message = e?.response?.data?.message;

      console.log("카카오 로그인 에러:", e);

      if (status === 409 && code === "A005") {
        Alert.alert(
          "로그인 실패",
          "이미 다른 로그인 방식으로 가입된 이메일입니다. 기존에 사용한 로그인 방식으로 로그인해주세요."
        );
      } else if (status === 400 && code === "A004") {
        Alert.alert(
          "로그인 실패",
          "카카오 이메일 동의가 필요합니다. 다시 로그인 후 이메일 제공에 동의해주세요."
        );
      } else {
        Alert.alert(
          "로그인 실패",
          message ?? "카카오 로그인 중 문제가 발생했습니다."
        );
      }

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