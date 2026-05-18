import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import NextButton from "../../components/NextButton";
import { useSignupDraft } from "./signupContext";
import SignupProgress from "../../components/SignupProgress";
import { signupApi } from "../api/signup";

export default function Personal() {
  const router = useRouter();
  const { draft, setDraft, resetDraft } = useSignupDraft();

  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const [loading, setLoading] = useState(false);

  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    if (!nickname || !gender || !year || !month || !day) {
      Alert.alert("입력 필요", "모든 정보를 입력해주세요.");
      return;
    }

    const birthDate = `${year.padStart(4, "0")}-${month.padStart(
      2,
      "0"
    )}-${day.padStart(2, "0")}`;

    const payload = {
      email: draft.email ?? "",
      password: draft.password ?? "",
      username: nickname,
      gender: gender === "male" ? "MALE" : "FEMALE",
      birthDate,
    };

    try {
      setLoading(true);
      setDraft(payload);

      await signupApi(payload);

      Alert.alert("회원가입 완료", "로그인을 진행해주세요.");
      resetDraft();
      router.replace("/login/login");
    } catch (e: any) {
      Alert.alert(
        "회원가입 실패",
        e?.response?.data?.message ?? "문제가 발생했어요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>

        {/* 입력 영역만 KeyboardAvoidingView */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        ><ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
          <View style={styles.container}>

            {/* 헤더 */}
            <View style={styles.header}>
              <BackButton onPress={() => router.back()} />
              <SignupProgress step={4} />
            </View>

            {/* 타이틀 */}
            <Text style={styles.heading}>건강한 일상을 위한 첫 스파링!</Text>
            <Text style={styles.heading2}>함께 시작해볼까요?</Text>

            {/* 닉네임 */}
            <Text style={styles.subtext}>닉네임을 입력해주세요.</Text>
            <View style={styles.labelRow}>
              <Text style={styles.subtext2}>닉네임</Text>
              <Text style={styles.star}> *</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="닉네임 입력"
              value={nickname}
              onChangeText={setNickname}
              returnKeyType="done"
            />

            {/* 성별 */}
            <Text style={styles.subtext}>성별을 선택해주세요.</Text>
            <View style={styles.labelRow}>
              <Text style={styles.subtext2}>성별</Text>
              <Text style={styles.star}> *</Text>
            </View>

            <View style={styles.genderRow}>
              <Pressable
                style={[
                  styles.genderBtn,
                  gender === "male" && styles.selectedBtn,
                ]}
                onPress={() => setGender("male")}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === "male" && styles.selectedText,
                  ]}
                >
                  남성
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.genderBtn,
                  gender === "female" && styles.selectedBtn,
                ]}
                onPress={() => setGender("female")}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === "female" && styles.selectedText,
                  ]}
                >
                  여성
                </Text>
              </Pressable>
            </View>

            {/* 생년월일 */}
            <Text style={styles.subtext}>생년월일을 입력해주세요.</Text>
            <View style={styles.labelRow}>
              <Text style={styles.subtext2}>생년월일</Text>
              <Text style={styles.star}> *</Text>
            </View>

            <View style={styles.dateRow}>
              {/* YEAR */}
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY"
                keyboardType="number-pad"
                maxLength={4}
                value={year}
                onChangeText={(text) => {
                  setYear(text);
                  if (text.length === 4) {
                    monthRef.current?.focus();
                  }
                }}
              />

              {/* MONTH */}
              <TextInput
                ref={monthRef}
                style={styles.dateInput}
                placeholder="MM"
                keyboardType="number-pad"
                maxLength={2}
                value={month}
                onChangeText={(text) => {
                  setMonth(text);
                  if (text.length === 2) {
                    dayRef.current?.focus();
                  }
                }}
              />

              {/* DAY */}
              <TextInput
                ref={dayRef}
                style={styles.dateInput}
                placeholder="DD"
                keyboardType="number-pad"
                maxLength={2}
                value={day}
                onChangeText={setDay}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ✅ 버튼은 바깥 (고정됨) */}
        <View style={styles.bottomButton}>
          <NextButton
            title={loading ? "가입 중..." : "다음"}
            onPress={handleSubmit}
          />
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },

  bottomButton: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  heading: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: "600",
    color: "#1e1d1d",
  },

  heading2: {
    marginTop: 5,
    fontSize: 20,
    fontWeight: "600",
    color: "#1e1d1d",
  },

  subtext: {
    marginTop: 40,
    fontSize: 16,
    fontWeight: "500",
    color: "#1e1d1d",
  },

  subtext2: {
    fontSize: 12,
    color: "#1e1d1d",
    marginVertical: 10,
  },

  star: {
    fontSize: 12,
    color: "#fa1212",
    marginVertical: 10,
  },

  labelRow: {
    flexDirection: "row",
  },

  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingHorizontal: 16,
  },

  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  genderBtn: {
    width: "48%",
    height: 56,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  selectedBtn: {
    borderColor: "#eec4c4",
    backgroundColor: "#eec4c4",
  },

  genderText: {
    color: "#999",
  },

  selectedText: {
    color: "#262626",
    fontWeight: "600",
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dateInput: {
    width: "30%",
    height: 56,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 16,
    textAlign: "center",
  },
});