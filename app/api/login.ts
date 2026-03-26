import { post } from "./index";
import { setTokensToStorage } from "../utils/asyncStorage";

type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  token?: string; // 혹시 token으로 오면 대비
  [key: string]: any;
};

export const loginApi = async (payload: LoginRequest) => {
  const res = await post<LoginResponse>("/api/auth/login", payload);

  const data = res.data?.data ?? res.data;
  const accessToken = data?.accessToken ?? data?.token;
  const refreshToken = data?.refreshToken;

  if (!accessToken) throw new Error("로그인 응답에 accessToken이 없습니다.");

  await setTokensToStorage(accessToken, refreshToken);
  return data;
};