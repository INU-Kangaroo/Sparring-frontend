// app/api/auth.ts
import { post } from "./index";

export type SendVerificationResponse = any;
export type VerifyCodeResponse = any;

export const sendVerificationCode = async (
  email: string
): Promise<SendVerificationResponse> => {
  const response = await post<SendVerificationResponse>(
    "/api/auth/send-verification",
    { email }
  );
  return response.data;
};

export const verifyCodeApi = async (
  email: string,
  code: string
): Promise<VerifyCodeResponse> => {
  const response = await post<VerifyCodeResponse>(
    "/api/auth/verify-code",
    { email, code }
  );
  return response.data;
};
