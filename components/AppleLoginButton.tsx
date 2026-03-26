import React from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Alert } from "react-native";
import { useAppleLogin } from "../hooks/useAppleLogin";

export default function AppleLoginButton() {
  const { login, isLoading } = useAppleLogin();

  const handlePress = async () => {
    try {
      await login();
    } catch (e: any) {
      Alert.alert("애플 로그인", e.message ?? "로그인에 실패했습니다.");
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={8}
      style={{ width: "100%", height: 45 }}
      onPress={handlePress}
      disabled={isLoading}
    />
  );
}