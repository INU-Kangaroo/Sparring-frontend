import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import InputField from "../../components/InputField";
import NextButton from "../../components/NextButton";
import { useSurveyDraft } from "../survey/surveyContext";
import SignupProgress from "@/components/SignupProgress";

export default function Stats() {
  const router = useRouter();
  const { setAnswer } = useSurveyDraft();

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleNext = () => {
    const h = Number(height);
    const w = Number(weight);

    if (!h || !w) {
      Alert.alert("입력 필요", "키/몸무게를 모두 입력해주세요.");
      return;
    }

    setAnswer("HEIGHT", h);
    setAnswer("WEIGHT", w);

    router.push("/survey/survey");
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <SignupProgress step={0} />
      </View>

      <Text style={styles.heading}>나의 건강 시그널을 확인하고 싶다면?</Text>
      <Text style={styles.heading2}>3초만에 설문조사!</Text>

      <Text style={styles.subtext}>당신의 사전 정보를 알려주세요</Text>

      <View style={styles.labelRow}>
        <Text style={styles.label}>키</Text>
        <Text style={styles.star}> *</Text>
      </View>

      <InputField
        value={height}
        onChangeText={setHeight}
        placeholder="cm"
        keyboardType="number-pad"
        secure={false}
      />

      <View style={styles.labelRow}>
        <Text style={styles.label}>몸무게</Text>
        <Text style={styles.star}> *</Text>
      </View>

      <InputField
        value={weight}
        onChangeText={setWeight}
        placeholder="kg"
        keyboardType="number-pad"
        secure={false}
      />

      <View style={{ marginTop: "auto", width: "100%" }}>
        <NextButton title="다음" onPress={handleNext} />
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
  header: { flexDirection: "row", alignItems: "center", width: "100%", paddingHorizontal: 1 },

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
    marginBottom: -10,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e1d1dff",
  },
  star: {
    fontSize: 13,
    color: "#e53935",
  },
});