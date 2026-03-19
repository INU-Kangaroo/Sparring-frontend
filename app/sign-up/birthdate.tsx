import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import NextButton from "../../components/NextButton";
import { useSignupDraft } from "./signupContext";
import { signupApi } from "../api/signup";

export default function Birthdate() {
  const router = useRouter();
  const { draft, setDraft, resetDraft } = useSignupDraft();

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [loading, setLoading] = useState(false);

  const nextPage = async () => {
    if (!year || !month || !day) {
      Alert.alert("입력 필요", "생년월일을 모두 입력해주세요.");
      return;
    }

    const y = year.padStart(4, "0");
    const m = month.padStart(2, "0");
    const d = day.padStart(2, "0");
    const birthDate = `${y}-${m}-${d}`;

    const payload = {
      email: draft.email ?? "",
      password: draft.password ?? "",
      username: draft.username ?? "",
      gender: draft.gender as "MALE" | "FEMALE",
      birthDate,
    };

    if (
      !payload.email ||
      !payload.password ||
      !payload.username ||
      !payload.gender ||
      !payload.birthDate
    ) {
      Alert.alert("오류", "회원가입 정보가 누락되었어요. 처음부터 다시 진행해주세요.");
      return;
    }

    try {
      setLoading(true);

      setDraft({ birthDate });

      const result = await signupApi(payload);
      console.log("signup result =", result);

      Alert.alert("회원가입 완료", "로그인을 진행해주세요.");
      resetDraft();
      router.replace("/login/login");
    } catch (e: any) {
      console.log("signup error =", e?.response?.data ?? e);

      Alert.alert(
        "회원가입 실패",
        e?.response?.data?.message ?? "회원가입 중 문제가 발생했어요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
        </View>

        <Text style={styles.heading}>나의 건강 시그널을 확인하고 싶다면?</Text>
        <Text style={styles.heading2}>3초만에 회원가입!</Text>

        <Text style={styles.subtext}>생년 월일을 입력해주세요</Text>

        <View style={styles.labelRow}>
          <Text style={styles.subtext2}>생년월일</Text>
          <Text style={styles.star}> *</Text>
        </View>

        <View style={styles.dateRow}>
          <TextInput
            style={styles.input}
            placeholder="Year"
            placeholderTextColor="#ccc"
            keyboardType="number-pad"
            maxLength={4}
            value={year}
            onChangeText={setYear}
          />

          <TextInput
            style={styles.input}
            placeholder="Month"
            placeholderTextColor="#ccc"
            keyboardType="number-pad"
            maxLength={2}
            value={month}
            onChangeText={setMonth}
          />

          <TextInput
            style={styles.input}
            placeholder="Day"
            placeholderTextColor="#ccc"
            keyboardType="number-pad"
            maxLength={2}
            value={day}
            onChangeText={setDay}
          />
        </View>

        <View style={{ marginTop: "auto", width: "100%", marginBottom: 20 }}>
          <NextButton title={loading ? "가입 중..." : "다음"} onPress={nextPage} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 30, backgroundColor: "#fff" },
  header: { width: "100%" },
  heading: { marginTop: 30, fontSize: 20, fontWeight: "600", color: "#1e1d1dff" },
  heading2: { marginTop: 5, fontSize: 20, fontWeight: "600", color: "#1e1d1dff" },
  subtext: { marginTop: 70, fontSize: 16, fontWeight: "500", color: "#1e1d1dff" },
  labelRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  subtext2: { fontSize: 12, color: "#1e1d1dff" },
  star: { fontSize: 12, color: "#fa1212ff" },
  dateRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  input: {
    width: "30%",
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    textAlign: "center",
    fontSize: 16,
    color: "#111",
  },
});