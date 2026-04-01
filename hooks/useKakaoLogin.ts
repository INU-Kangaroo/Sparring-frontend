import { useCallback, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  login,
  getProfile,
  logout,
  unlink,
} from "@react-native-seoul/kakao-login";
import { loginWithKakaoSdk } from "../app/api/kakao";
import type { OAuthJwtResponse } from "../app/api/oauth";

function stringifyError(error: any) {
  try {
    return JSON.stringify(
      {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        type: error?.type,
        status: error?.response?.status,
        responseData: error?.response?.data,
        nativeStackIOS: error?.nativeStackIOS,
        stack: error?.stack,
      },
      null,
      2
    );
  } catch {
    return String(error);
  }
}

export function useKakaoLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithKakao = useCallback(async (): Promise<OAuthJwtResponse> => {
    setIsLoading(true);

    try {
      console.log("========== 카카오 로그인 시작 ==========");
      console.log("platform =", Platform.OS);
      console.log("ENV NATIVE APP KEY =", process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY);
      console.log("ENV REST API KEY =", process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY);
      console.log("ENV KAKAO SCHEME =", process.env.EXPO_PUBLIC_KAKAO_SCHEME);
      console.log("현재 시점: login() 호출 직전");

      let token: any = null;

      try {
        token = await login();
        console.log("카카오 SDK login() 성공");
        console.log("카카오 SDK 응답 raw =", token);
        console.log("카카오 SDK 응답 json =", JSON.stringify(token, null, 2));
      } catch (sdkError: any) {
        console.log("카카오 SDK login() 실패");
        console.log("카카오 SDK 에러 raw =", sdkError);
        console.log("카카오 SDK 에러 상세 =", stringifyError(sdkError));

        Alert.alert(
          "카카오 SDK 로그인 실패",
          sdkError?.message ?? "카카오 SDK 단계에서 로그인에 실패했습니다."
        );
        throw sdkError;
      }

      if (!token?.accessToken) {
        console.log("카카오 accessToken 없음");
        console.log("token =", JSON.stringify(token, null, 2));
        throw new Error("카카오 accessToken을 받지 못했습니다.");
      }

      console.log("카카오 accessToken 확보 성공");
      console.log("accessToken 앞 12자리 =", `${token.accessToken.slice(0, 12)}...`);
      console.log("refreshToken 존재 여부 =", !!token?.refreshToken);
      console.log("idToken 존재 여부 =", !!token?.idToken);
      console.log("accessTokenExpiresAt =", token?.accessTokenExpiresAt);
      console.log("refreshTokenExpiresAt =", token?.refreshTokenExpiresAt);

      try {
        const profile = await getProfile();
        console.log("카카오 프로필 조회 성공 =", JSON.stringify(profile, null, 2));
      } catch (profileError: any) {
        console.log("카카오 프로필 조회 실패 =", stringifyError(profileError));
      }

      console.log("백엔드 /api/auth/oauth2/kakao/sdk 호출 시작");

      const jwtPayload = await loginWithKakaoSdk({
        accessToken: token.accessToken,
      });

      console.log("백엔드 카카오 로그인 응답 성공");
      console.log("jwtPayload =", JSON.stringify(jwtPayload, null, 2));
      console.log("========== 카카오 로그인 완료 ==========");

      return jwtPayload;
    } catch (e: any) {
      const status = e?.response?.status;
      const code = e?.response?.data?.code;
      const message = e?.response?.data?.message;

      console.log("카카오 로그인 최종 에러 raw =", e);
      console.log("카카오 로그인 최종 에러 상세 =", stringifyError(e));
      console.log("status =", status);
      console.log("code =", code);
      console.log("message =", message);

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
      } else if (!e?.response) {
        Alert.alert(
          "로그인 실패",
          e?.message ?? "카카오 SDK 또는 앱 설정 문제로 로그인에 실패했습니다."
        );
      } else {
        Alert.alert(
          "로그인 실패",
          message ?? "카카오 로그인 중 문제가 발생했습니다."
        );
      }

      throw e;
    } finally {
      console.log("카카오 로그인 로딩 종료");
      setIsLoading(false);
    }
  }, []);

  const debugLogout = useCallback(async () => {
    try {
      await logout();
      console.log("카카오 logout 성공");
    } catch (e: any) {
      console.log("카카오 logout 실패 =", stringifyError(e));
    }
  }, []);

  const debugUnlink = useCallback(async () => {
    try {
      await unlink();
      console.log("카카오 unlink 성공");
    } catch (e: any) {
      console.log("카카오 unlink 실패 =", stringifyError(e));
    }
  }, []);

  return {
    login: loginWithKakao,
    isLoading,
    disabled: isLoading,
    debugLogout,
    debugUnlink,
  };
}