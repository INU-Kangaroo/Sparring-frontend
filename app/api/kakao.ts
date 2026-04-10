  import { post } from "./index";
  import { saveTokensFromOAuth, type OAuthJwtResponse } from "./oauth";

  export type KakaoSdkLoginRequest = {
    accessToken: string;
  };

  const unwrap = <T>(res: any): T => (res?.data?.data ?? res?.data ?? res) as T;

  export async function loginWithKakaoSdk(
    payload: KakaoSdkLoginRequest
  ): Promise<OAuthJwtResponse> {
    console.log("[KAKAO API] 요청 시작");
    console.log("[KAKAO API] payload =", {
      accessToken: payload?.accessToken
        ? `${payload.accessToken.slice(0, 12)}...`
        : null,
    });

    const res = await post("/api/auth/oauth2/kakao/sdk", payload);

    console.log("[KAKAO API] raw response =", JSON.stringify(res?.data, null, 2));

    const data = unwrap<OAuthJwtResponse>(res);

    console.log("[KAKAO API] unwrap response =", JSON.stringify(data, null, 2));

    await saveTokensFromOAuth(data);
    console.log("[KAKAO API] 토큰 저장 완료");

    return data;
  }