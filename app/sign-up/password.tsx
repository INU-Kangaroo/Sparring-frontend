import { useState } from "react";
import { View, Text, StyleSheet,  Keyboard, TouchableWithoutFeedback } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import BackButton from "../../components/BackButton";
import InputField from "../../components/InputField";
import NextButton from "../../components/NextButton";
import { useSignupDraft } from "./signupContext";
import SignupProgress from "@/components/SignupProgress";

export default function Password() {
  const router = useRouter();
  const { setDraft } = useSignupDraft();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const isValidPassword =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(password);

  const isMatch = password === confirm;

  const handleNext = () => {
    if (!isValidPassword || !isMatch) return;

    setDraft({ password });
    router.push("/sign-up/personal");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
     <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <SignupProgress step={2} />  
        </View>
      <Text style={styles.heading}>건강한 일상을 위한 첫 스파링!</Text>
      <Text style={styles.heading2}>함께 건강 관리 시작해볼까요?</Text>
      <Text style={styles.subtext}>비밀번호를 입력해주세요.</Text>


      <View style={styles.labelRow}>
        <Text style={styles.label}>비밀번호</Text>
        <Text style={styles.star}> *</Text>
      </View>

      <InputField
        value={password}
        onChangeText={setPassword}
        placeholder="1234abcd!"
        secure
        returnKeyType="next"
      />

      {!isValidPassword && password.length > 0 && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={16} color="#e53935" />
          <Text style={styles.errorText}>
            비밀번호는 영문, 숫자, 특수문자 포함 8자 이상이어야 합니다.
          </Text>
        </View>
      )}

      <View style={styles.labelRow}>
        <Text style={styles.label}>비밀번호 재입력</Text>
        <Text style={styles.star}> *</Text>
      </View>

      <InputField
        value={confirm}
        onChangeText={setConfirm}
        placeholder="1234abcd!"
        secure
        returnKeyType="done"
        onSubmitEditing={handleNext}
      />

      {confirm.length > 0 && !isMatch && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={16} color="#e53935" />
          <Text style={styles.errorText}>일치하지 않습니다.</Text>
        </View>
      )}

      <View style={{ marginTop: "auto", width: "100%" }}>
        <NextButton title="다음" onPress={handleNext} />
      </View>
    </View>
    </View>
     </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 30, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", width: "100%", paddingHorizontal: 1 },
  heading: { marginTop: 30, fontSize: 20, fontWeight: "600", color: "#111" },
  heading2: { marginTop: 5, fontSize: 20, alignSelf: "flex-start", fontWeight: "600", color: "#1e1d1dff" },
  subtext: { marginTop: 70, alignSelf: "flex-start", fontSize: 16, fontWeight: "500", color: "#1e1d1dff", marginBottom: -10 },
  label: { fontSize: 12, color: "#1e1d1dff" },
  labelRow: { flexDirection: "row", marginTop: 30 },
  star: { fontSize: 13, color: "#e53935" },
  errorRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  errorText: { fontSize: 12, color: "#e53935", marginLeft: 6 },
});