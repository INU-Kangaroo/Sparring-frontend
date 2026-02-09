// app/api/signup.ts
import { post } from "./index";

type SignupRequest = Record<string, any>;
type SignupResponse = any;

const getFcmTokenFromStorage = async (): Promise<string> => {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("fcmToken") ?? "";
  }
  return ((globalThis as any).__fcmToken as string) ?? "";
};

export const signupApi = async (data: SignupRequest): Promise<SignupResponse> => {
  try {
    const fcmToken = await getFcmTokenFromStorage();

    const requestData = {
      ...data,
      fcmToken,
    };

    const response = await post<SignupResponse>("/api/auth/sign-up", requestData);
    return response.data;
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

    throw new Error("회원가입에 실패했습니다.");
  }
};
