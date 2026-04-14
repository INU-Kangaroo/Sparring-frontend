import React from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useOauthLogin } from "../../hooks/useOAuthLogin";
import { useKakaoLogin } from "../../hooks/useKakaoLogin";

export default function LoginScreen() {
  const google = useOauthLogin();
  const kakao = useKakaoLogin();

  const onGoogleLogin = async () => {
    try {
      console.log("구글 로그인 버튼 클릭");
      await google.login();
      console.log("구글 로그인 성공 → /main/main 이동");
      router.replace("/main/main");
    } catch (error) {
      console.log("구글 로그인 실패 =", error);
      const message =
        error instanceof Error ? error.message : "구글 로그인에 실패했습니다.";
      Alert.alert("로그인 실패", message);
    }
  };

  const onKakaoLogin = async () => {
    try {
      console.log("카카오 로그인 버튼 클릭");
      await kakao.login();
      console.log("카카오 로그인 성공 → /main/main 이동");
      router.replace("/main/main");
    } catch (error) {
      console.log("카카오 로그인 버튼 핸들러 실패 =", error);
      const message =
        error instanceof Error ? error.message : "카카오 로그인에 실패했습니다.";
      Alert.alert("로그인 실패", message);
    }
  };

  const goSignup = () => {
    router.push({ pathname: "/sign-up/email" as any });
  };

  const goLogin = () => {
    router.push("/login/login");
  };

  const isAnyLoading = google.isLoading || kakao.isLoading;
  const isGoogleDisabled = google.disabled || kakao.isLoading;
  const isLoginDisabled = isAnyLoading;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.centerWrap}>
          <Text style={styles.topText}>
            나의 건강 시그널이 궁금하다면?
          </Text>
           <Text style={styles.title}>Sparring과 같이 확인하기</Text>

          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Sparring</Text>
        </View>

        <View style={styles.buttonWrap}>
          <Pressable
            style={[styles.socialBtn, isGoogleDisabled ? styles.disabledBtn : null]}
            onPress={onGoogleLogin}
            disabled={isGoogleDisabled}
          >
            <Image
              source={require("../../assets/images/google.png")}
              style={styles.leftIcon}
              resizeMode="contain"
            />
            <Text style={styles.btnText}>
              {google.isLoading ? "로그인 중..." : "Google 로그인"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.socialBtn, kakao.disabled ? styles.disabledBtn : null]}
            onPress={onKakaoLogin}
            disabled={kakao.disabled}
          >
            <Image
              source={require("../../assets/images/kakao.png")}
              style={styles.leftIcon}
              resizeMode="contain"
            />
            <Text style={styles.btnText}>
              {kakao.isLoading ? "로그인 중..." : "카카오 로그인"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.socialBtn, isLoginDisabled ? styles.disabledBtn : null]}
            onPress={goLogin}
            disabled={isLoginDisabled}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.leftIcon}
              resizeMode="contain"
            />
            <Text style={styles.btnText}>
              {isAnyLoading ? "로그인 중..." : "로그인"}
            </Text>
          </Pressable>

          <Pressable onPress={goSignup} style={styles.signupWrap}>
            <Text style={styles.signupText}>회원 가입하기</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BORDER = "#C4C4C4";
const TEXT_GRAY = "#C4C4C4";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topText: {
    marginTop: 40,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000000",
  },
  logo: { width: 300, height: 270,},
    subtitle: {
    marginTop: -20,
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  buttonWrap: {
    paddingBottom: 40,
    gap: 12,
    alignItems: "center",
  },
  socialBtn: {
    width: "100%",
    maxWidth: 343,
    height: 51,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  leftIcon: {
    width: 25,
    height: 25,
    position: "absolute",
    left: 20,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_GRAY,
  },
  signupWrap: {
    marginTop: 8,
    paddingVertical: 8,
  },
  signupText: {
    fontSize: 12,
    color: "#C4C4C4",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  disabledBtn: { opacity: 0.6 },
});