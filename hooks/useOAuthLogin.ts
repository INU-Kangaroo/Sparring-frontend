import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useMemo, useState } from "react";
import { Platform } from "react-native";
import {
  exchangeGoogleOAuthCode,
  saveTokensFromOAuth,
  type OAuthJwtResponse,
} from "../app/api/oauth";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS ?? ""
    : process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  export function useOauthLogin() {
    const [isLoading, setIsLoading] = useState(false);

  const redirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        path: "oauthredirect",
        native:
          "com.googleusercontent.apps.37689583487-nqo5jr9nuemk4289gnvq3cutuuf4c7de:/oauthredirect",
      }),
    []
  );

  const discovery = useMemo(
    () => ({
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
    }),
    []
  );

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      scopes: [
        "openid",
        "profile",
        "email",
        "https://www.googleapis.com/auth/user.birthday.read",
        "https://www.googleapis.com/auth/user.gender.read",
      ],
    },
    discovery
  );

  const login = useCallback(async (): Promise<OAuthJwtResponse> => {
    setIsLoading(true);

    try {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error("Google Client ID가 비어 있습니다.");
      }

      if (!request) {
        throw new Error("OAuth 요청 객체가 아직 준비되지 않았습니다.");
      }

      console.log("[Google OAuth] clientId =", GOOGLE_CLIENT_ID);
      console.log("[Google OAuth] redirectUri =", redirectUri);
      console.log("[Google OAuth] codeVerifier =", request.codeVerifier);

      const result = await promptAsync();

      console.log("[Google OAuth] result =", JSON.stringify(result, null, 2));

      if (result.type !== "success") {
        throw new Error(`OAuth 실패: ${result.type}`);
      }

      const code = result.params?.code;
      if (!code) {
        throw new Error("authorization code를 받지 못했습니다.");
      }

      const codeVerifier = request.codeVerifier;
      if (!codeVerifier) {
        throw new Error("PKCE codeVerifier가 없습니다.");
      }

      const tokenPayload = await exchangeGoogleOAuthCode({
        code,
        redirectUri,
        codeVerifier,
      });

      await saveTokensFromOAuth(tokenPayload);
      return tokenPayload;
    } catch (e: any) {
      console.log("[Google OAuth] final error =", e?.message ?? e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [promptAsync, redirectUri, request]);

  return {
    login,
    disabled: !request || isLoading,
    isLoading,
    redirectUri,
  };
}
