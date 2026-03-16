import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import NextButton from "../../components/NextButton";
import { useSurveyDraft } from "./surveyContext";
import { submitSurvey } from "../api/survey";

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const Chip = ({ label, selected, onPress }: ChipProps) => (
  <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>
);

export default function Survey3Screen() {
  const router = useRouter();
  const { setAnswer, resetDraft, toAnswersArray } = useSurveyDraft();

  const [sleepHours, setSleepHours] = useState("");
  const [sleepQuality, setSleepQuality] = useState<string | null>(null);
  const [smokingStatus, setSmokingStatus] = useState<string | null>(null);
  const [drinkingFrequency, setDrinkingFrequency] = useState<string | null>(null);
  const [stressLevel, setStressLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canNext = useMemo(() => {
    return !!(
      sleepHours.trim() &&
      sleepQuality &&
      smokingStatus &&
      drinkingFrequency &&
      stressLevel
    );
  }, [sleepHours, sleepQuality, smokingStatus, drinkingFrequency, stressLevel]);

  const handleNext = async () => {
    if (!canNext) return;

    setAnswer("SLEEP_HOURS", Number(sleepHours));
    setAnswer("SLEEP_QUALITY", sleepQuality!);
    setAnswer("SMOKING_STATUS", smokingStatus!);
    setAnswer("DRINKING_FREQUENCY", drinkingFrequency!);
    setAnswer("STRESS_LEVEL", stressLevel!);

    try {
      setLoading(true);

      await submitSurvey({
        answers: toAnswersArray(),
      });

      resetDraft();
      router.replace("/main/main");
    } catch (e: any) {
      Alert.alert("설문 제출 실패", e?.message ?? "잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />

        <Text style={styles.heading}>나의 건강 시그널 확인하고 싶다면?</Text>
        <Text style={styles.heading2}>회원가입을 축하드립니다!</Text>

        <View style={styles.divider} />

        <Text style={styles.subtext}>당신의 생활 습관에 대해 알려주세요</Text>

        <View style={styles.labelRow}>
          <Text style={styles.label}>평균 수면 시간</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="하루 평균 수면 시간을 작성해주세요 ex) 6"
          keyboardType="number-pad"
          value={sleepHours}
          onChangeText={setSleepHours}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>수면의 질</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { code: "GOOD", label: "좋음" },
            { code: "NORMAL", label: "보통" },
            { code: "BAD", label: "나쁨" },
          ].map((item) => (
            <Chip
              key={item.code}
              label={item.label}
              selected={sleepQuality === item.code}
              onPress={() => setSleepQuality(item.code)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>흡연 여부</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { code: "true", label: "예" },
            { code: "false", label: "아니오" },
          ].map((item) => (
            <Chip
              key={item.code}
              label={item.label}
              selected={smokingStatus === item.code}
              onPress={() => setSmokingStatus(item.code)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>음주 빈도</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { code: "NONE", label: "없음" },
            { code: "ONE_TO_TWO_PER_WEEK", label: "주 1~2회" },
            { code: "THREE_OR_MORE_PER_WEEK", label: "주 3회 이상" },
          ].map((item) => (
            <Chip
              key={item.code}
              label={item.label}
              selected={drinkingFrequency === item.code}
              onPress={() => setDrinkingFrequency(item.code)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>스트레스 수준</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { code: "LOW", label: "낮음" },
            { code: "MEDIUM", label: "중간" },
            { code: "HIGH", label: "높음" },
          ].map((item) => (
            <Chip
              key={item.code}
              label={item.label}
              selected={stressLevel === item.code}
              onPress={() => setStressLevel(item.code)}
            />
          ))}
        </View>

        <View style={{ marginTop: 40 }}>
          <NextButton
            title={loading ? "제출 중..." : "완료"}
            onPress={handleNext}
            disabled={!canNext || loading}
          />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 60, paddingHorizontal: 30, paddingBottom: 40, backgroundColor: "#fff" },
  heading: { marginTop: 30, fontSize: 20, fontWeight: "600", color: "#111" },
  heading2: { marginTop: 5, fontSize: 14, fontWeight: "500", color: "#111" },
  divider: { height: 1, backgroundColor: "#EAEAEA", marginTop: 16 },
  subtext: { marginTop: 22, fontSize: 16, fontWeight: "500", color: "#111", marginBottom: 10 },
  labelRow: { flexDirection: "row", marginTop: 26 },
  label: { fontSize: 14, fontWeight: "500", color: "#111" },
  star: { fontSize: 13, color: "#e53935" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 14, height: 34, borderRadius: 18, backgroundColor: "#747474", justifyContent: "center" },
  chipSelected: { backgroundColor: "#1435b9f6" },
  chipText: { color: "#fff", fontSize: 13, fontWeight: "500" },
  chipTextSelected: { fontWeight: "700" },
  input: { marginTop: 12, height: 50, borderRadius: 14, backgroundColor: "#F3F3F3", paddingHorizontal: 16, fontSize: 14, color: "#111" },
});