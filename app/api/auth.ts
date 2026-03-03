import { post } from "./index";

export type SendVerificationResponse = any;
export type VerifyCodeResponse = any;
export type ResendVerificationResponse = any;

export const sendVerificationCode = async (email: string) => {
  const response = await post<SendVerificationResponse>(
    "/api/auth/send-verification",
    { email }
  );
  return response.data;
};

export const verifyCodeApi = async (args: { email: string; code: string; verificationId?: string }) => {
  // 명세 참고: verificationId를 함께 보내야 할 수 있음
  const response = await post<VerifyCodeResponse>(
    "/api/auth/verify-code",
    args
  );
  return response.data;
};

export const resendVerificationCode = async (email: string) => {
  const response = await post<ResendVerificationResponse>(
    "/api/auth/resend-verification",
    { email }
  );
  return response.data;
};