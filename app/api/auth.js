import { post } from "./index";

export const sendVerificationCode = async (email) => {
  const response = await post("/api/auth/send-verification", { email });
  return response.data;
};

export const verifyCodeApi = async (email, code) => {
  const response = await post("/api/auth/verify-code", { email, code });
  return response.data;
};
