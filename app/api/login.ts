// app/api/login.ts
import { Platform } from "react-native";
import { post } from "./index";

type LoginRequest = Record<string, any>;

type LoginResponseShape = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

// 네 코드에서 response.data.data.accessToken 구조였으니, 그 형태도 대응
type ApiEnvelope<T> = {
  data?: T;
  [key: string]: any;
};

type TokenData = {
  accessToken: string;
  refreshToken?: string;
};

const saveUserTokens = async (tokens: TokenData) => {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("userTokens", JSON.stringify(tokens));
    }
    return;
  }
  // native 임시 저장 (개발용)
  (globalThis as any).__userTokens = tokens;
};

export const loginApi = async (data: LoginRequest): Promise<number> => {
  try {
    const response = await post<ApiEnvelope<LoginResponseShape>>("/v1/auth/login", {
      ...data,
    });

    const accessToken =
      response?.data?.data?.data?.accessToken ?? response?.data?.data?.accessToken;
    const refreshToken =
      response?.data?.data?.data?.refreshToken ?? response?.data?.data?.refreshToken;

    if (!accessToken) {
      throw new Error("로그인 응답에 accessToken이 없습니다.");
    }

    await saveUserTokens({ accessToken, refreshToken });
    return response.status;
  } catch (error: any) {
    if (error?.response) {
      console.error("응답 오류 데이터:", error.response.data);
      console.error("응답 상태 코드:", error.response.status);
      console.error("응답 헤더:", error.response.headers);
    } else if (error?.request) {
      console.error("요청 오류:", error.request);
    } else {
      console.error("오류 메시지:", error?.message);
    }

    throw new Error("로그인에 실패했습니다.");
  }
};
