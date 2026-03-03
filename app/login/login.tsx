import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import BackButton from "../../components/BackButton";
import InputField from "../../components/InputField";
import NextButton from "../../components/NextButton";
import { loginApi } from "../api/login"; 

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPassword = password.length >= 1;

  const handleLogin = async () => {
    const trimmed = email.trim();
    if (!isValidEmail || !isValidPassword) return;

    try {
      setLoading(true);

      await loginApi({ email: trimmed, password });

      // 토큰 저장은 loginApi 내부에서 끝남
      router.replace("/main/main");
    } catch (e: any) {
      Alert.alert("로그인 실패", e?.message ?? "이메일/비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
      </View>

      <Text style={styles.heading}>나의 건강 시그널 확인하고 싶다면?</Text>
      <Text style={styles.heading2}>로그인해주세요!</Text>

      <Text style={styles.subtext}>이메일과 비밀번호를 입력해주세요</Text>

      {/* 이메일 */}
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
        <NextButton title={loading ? "로그인 중..." : "로그인"} onPress={handleLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 30, backgroundColor: "#fff" },
  header: { width: "100%", paddingHorizontal: 1 },
  heading: { marginTop: 30, fontSize: 20, fontWeight: "600", color: "#111" },
  heading2: { marginTop: 5, fontSize: 20, alignSelf: "flex-start", fontWeight: "600", color: "#1e1d1dff" },
  subtext: { marginTop: 70, alignSelf: "flex-start", fontSize: 16, fontWeight: "500", color: "#1e1d1dff" },
  label: { fontSize: 12, color: "#1e1d1dff" },
  labelRow: { flexDirection: "row", marginTop: 30 },
  star: { fontSize: 12, color: "#e53935" },
  errorRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  errorText: { fontSize: 12, color: "#e53935", marginLeft: 4 },
});