import { post } from "./index";

export type Gender = "MALE" | "FEMALE";

export type SignupRequest = {
  email: string;
  password: string;
  username: string;
  birthDate: string;
  gender: Gender;
};

export type SignupResponse = {
  email?: string;
  message?: string;
  [key: string]: any;
};

export const signupApi = async (payload: SignupRequest) => {
  const res = await post<SignupResponse>("/api/auth/signup", payload);
  return res.data?.data ?? res.data;
};