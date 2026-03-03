import * as AuthSession from "expo-auth-session";
import { useCallback, useMemo, useState } from "react";
import {
  exchangeOAuthCode,
  getAuthorizationEndpoint,
  makeRedirectUri,
  saveTokensFromOAuth,
  type OAuthJwtResponse,
  type OAuthProvider,
} from "../app/api/oauth";

export function useOauthLogin(provider: OAuthProvider) {
  const [isLoading, setIsLoading] = useState(false);

  const redirectUri = useMemo(() => makeRedirectUri(), []);
  const discovery = useMemo(
    () => ({
      authorizationEndpoint: getAuthorizationEndpoint(provider),
    }),
    [provider]
  );

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      // 필수 파라미터라 넣는 값(백엔드 authorizationEndpoint 기반이면 실질적 의미는 크지 않음)
      clientId: provider,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: false, // 백엔드 설정에 맞춰 (너희 기존 코드가 false였음)
    },
    discovery
  );

  const login = useCallback(async (): Promise<OAuthJwtResponse> => {
    setIsLoading(true);
    try {
      const result = await promptAsync({ useProxy: true });

      if (result.type !== "success") {
        throw new Error("OAuth 로그인 취소/실패");
      }

      const code = result.params?.code;
      if (!code) {
        throw new Error("authorization code를 받지 못했습니다.");
      }

      const tokenPayload = await exchangeOAuthCode({
        provider,
        code,
        redirectUri,
      });

      await saveTokensFromOAuth(tokenPayload);
      return tokenPayload;
    } finally {
      setIsLoading(false);
    }
  }, [promptAsync, provider, redirectUri]);

  return {
    login,
    disabled: !request || isLoading,
    isLoading,
  };
}