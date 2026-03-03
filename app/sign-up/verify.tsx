import { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import CodeInput from "../../components/CodeInput";
import NextButton from "../../components/NextButton";
import { resendVerificationCode, verifyCodeApi } from "../api/auth";
import { useSignupDraft } from "./signupContext";

export default function Verify() {
  const router = useRouter();
  const { draft, setDraft } = useSignupDraft();

  const email = draft.email ?? "";
  const verificationId = draft.verificationId ?? "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const codeStr = useMemo(() => code.join(""), [code]);

  const handleNext = async () => {
    if (!email) {
      Alert.alert("오류", "이메일 정보가 없습니다. 다시 진행해주세요.");
      router.replace("/sign-up/email");
      return;
    }
    if (code.some((v) => v === "")) return;

    try {
      setLoading(true);
      await verifyCodeApi({ email, code: codeStr, verificationId });
      router.push("/sign-up/password");
    } catch (e: any) {
      Alert.alert("인증 실패", e?.message ?? "인증번호를 다시 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    try {
      setResendLoading(true);
      const res: any = await resendVerificationCode(email);

      const newVerificationId =
        res?.verificationId ??
        res?.data?.verificationId ??
        res?.result?.verificationId ??
        res?.verification_id ??
        verificationId;

      setDraft({ verificationId: newVerificationId });
      Alert.alert("전송 완료", "인증번호를 다시 보냈어요.");
    } catch {
      Alert.alert("재전송 실패", "잠시 후 다시 시도해주세요.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton onPress={() => router.back()} />

      <Text style={styles.heading}>나의 건강 시그널을 확인하고 싶다면?</Text>
      <Text style={styles.heading2}>3초만에 회원가입!</Text>

      <Text style={styles.subtext}>인증번호를 입력해주세요</Text>

      <View style={{ flexDirection: "row", alignSelf: "flex-start" }}>
        <Text style={styles.subtext2}>인증번호</Text>
        <Text style={styles.star}> *</Text>
      </View>

      <CodeInput code={code} setCode={setCode} />

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>메일을 못 받으셨나요? </Text>
        <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
          <Text style={styles.resendLink}>
            {resendLoading ? "전송중..." : "재인증"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: "auto", width: "100%" }}>
        <NextButton title={loading ? "검증 중..." : "다음"} onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 30, backgroundColor: "#fff" },
  heading: { marginTop: 30, fontSize: 20, fontWeight: "600", color: "#1e1d1dff" },
  heading2: { marginTop: 5, fontSize: 20, alignSelf: "flex-start", fontWeight: "600", color: "#1e1d1dff" },
  subtext: { marginTop: 70, alignSelf: "flex-start", fontSize: 16, fontWeight: "500", color: "#1e1d1dff" },
  subtext2: { alignSelf: "flex-start", fontSize: 12, color: "#1e1d1dff", marginVertical: 10 },
  star: { alignSelf: "flex-start", fontSize: 12, color: "#fa1212ff", marginVertical: 10 },
  resendContainer: { flexDirection: "row", marginTop: 25, alignSelf: "flex-start" },
  resendText: { fontSize: 13, color: "#9e9e9e" },
  resendLink: { fontSize: 13, color: "#626262ff", fontWeight: "600" },
});