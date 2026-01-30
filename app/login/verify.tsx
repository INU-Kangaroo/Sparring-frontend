import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function LoginScreen() {
  const onGoogleLogin = () => {
    router.replace("/");
  };

  const onKakaoLogin = () => {
    router.replace("/");
  };

  const goSignup = () => {
    router.push({ pathname: "/signup/email" as any });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* Center (문구 + 로고 + 부제) */}
        <View style={styles.centerWrap}>
          <Text style={styles.topText}>
            나의 건강 시그널을 확인하고 싶다면 ?
          </Text>

          <Image
            source={require("../../assets/images/login_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.subtitle}>맞춤형 건강 관리 앱</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonWrap}>
          <Pressable style={styles.socialBtn} onPress={onGoogleLogin}>
            <Image
              source={require("../../assets/images/google.png")}
              style={styles.leftIcon}
              resizeMode="contain"
            />
            <Text style={styles.btnText}>Google 로그인</Text>
          </Pressable>

          <Pressable style={styles.socialBtn} onPress={onKakaoLogin}>
            <Image
              source={require("../../assets/images/kakao.png")}
              style={styles.leftIcon}
              resizeMode="contain"
            />
            <Text style={styles.btnText}>Kakao 로그인</Text>
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
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },

  /* 중앙 영역 */
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  topText: {
    marginBottom: 24, // ⬅️ 로고 바로 위 느낌
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },

  logo: {
    width: 180,
    height: 80,
  },

  subtitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },

  /* 버튼 영역 */
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
    width: 20,
    height: 20,
    position: "absolute",
    left: 18,
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
});