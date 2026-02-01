import * as AuthSession from "expo-auth-session";
import { useEffect } from "react";
import { router } from "expo-router";

const BACKEND_URL = process.env.BACKEND_URL!; 

export function useGoogleLogin() {
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  const discovery = {
    authorizationEndpoint: `${BACKEND_URL}/oauth2/authorization/google`,
    tokenEndpoint: "",
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: "", 
      redirectUri,
      responseType: "code",
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;

      fetch(`${BACKEND_URL}/oauth2/authorization/google?code=${code}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then(() => router.replace("/main/main"))
        .catch(console.error);
    }
  }, [response]);

  return { login: () => promptAsync(), disabled: !request };
}
