import { post } from "./index";
import { saveTokensFromOAuth, type OAuthJwtResponse } from "./oauth";

export type KakaoSdkLoginRequest = {
  accessToken: string;
};

const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data ?? res) as T;

export async function loginWithKakaoSdk(
  payload: KakaoSdkLoginRequest
): Promise<OAuthJwtResponse> {
  const res = await post("/api/auth/oauth2/kakao/sdk", payload);
  const data = unwrap<OAuthJwtResponse>(res);
  await saveTokensFromOAuth(data);
  return data;
}