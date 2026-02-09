import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import BackButton from "../../components/BackButton";
import InputField from "../../components/InputField";
import NextButton from "../../components/NextButton";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= 1; // 로그인에서는 길이만 체크

  const handleLogin = () => {
    if (!isValidEmail || !isValidPassword) return;

    // 개발 중: API 없이 바로 이동
    if (__DEV__) {
      console.log("[DEV] 로그인 스킵:", email);
      router.replace("/survey");
      return;
    }

    // TODO: 실제 로그인 API 연동
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
      </View>

      <Text style={styles.heading}>나의 건강 시그널 확인하고 싶다면?</Text>
      <Text style={styles.heading2}>로그인해주세요!</Text>

      {/* 이메일 */}
       <Text style={styles.subtext}>이메일과 비밀번호를 입력해주세요</Text>
      <View style={styles.labelRow}>
        <Text style={styles.label}>이메일</Text>
        <Text style={styles.star}> *</Text>
      </View>

      <InputField
        value={email}
        onChangeText={setEmail}
        placeholder="inu@inu.ac.kr"
        keyboardType="email-address"
      />

      {email.length > 0 && !isValidEmail && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={16} color="#e53935" />
          <Text style={styles.errorText}>이메일 형식이 올바르지 않습니다.</Text>
        </View>
      )}

      {/* 비밀번호 */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>비밀번호</Text>
        <Text style={styles.star}> *</Text>
      </View>

      <InputField
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호 입력"
        secure
      />

      {password.length === 0 && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={16} color="#e53935" />
          <Text style={styles.errorText}>비밀번호를 입력해주세요.</Text>
        </View>
      )}

      <View style={{ marginTop: "auto", width: "100%" }}>
        <NextButton title="로그인" onPress={handleLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    paddingHorizontal: 1,
  },
  heading: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  heading2: {
    marginTop: 5,
    fontSize: 20,
    alignSelf: "flex-start",
    fontWeight: "600",
    color: "#1e1d1dff",
  },
  subtext: {
    marginTop: 70,
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "500",
    color: "#1e1d1dff",
  },
  label: {
    fontSize: 12,
    color: "#1e1d1dff",
  },
  labelRow: {
    flexDirection: "row",
    marginTop: 30,
  },
  star: {
    fontSize: 12,
    color: "#e53935",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#e53935",
    marginLeft: 4,
  },
});
