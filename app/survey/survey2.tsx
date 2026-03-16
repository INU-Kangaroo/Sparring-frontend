import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import NextButton from "../../components/NextButton";
import { useSurveyDraft } from "./surveyContext";

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

export default function Survey2Screen() {
  const router = useRouter();
  const { setAnswer } = useSurveyDraft();

  const [exerciseFrequency, setExerciseFrequency] = useState<string | null>(null);
  const [exercisePlace, setExercisePlace] = useState<string[]>([]);
  const [exerciseType, setExerciseType] = useState("");
  const [exerciseDuration, setExerciseDuration] = useState<string | null>(null);
  const [avgSteps, setAvgSteps] = useState("");

  const toggleMulti = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const canNext = useMemo(() => {
    return !!(
      exerciseFrequency &&
      exercisePlace.length > 0 &&
      exerciseDuration &&
      avgSteps.trim()
    );
  }, [exerciseFrequency, exercisePlace, exerciseDuration, avgSteps]);

  const handleNext = () => {
    if (!canNext) return;

    setAnswer("EXERCISE_FREQUENCY", exerciseFrequency!);
    setAnswer("EXERCISE_PLACE", exercisePlace);
    setAnswer("EXERCISE_TYPE", exerciseType.trim());
    setAnswer("EXERCISE_DURATION", exerciseDuration!);
    setAnswer("AVG_STEPS", Number(avgSteps));

    router.push("/survey/survey3");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />

        <Text style={styles.heading}>나의 건강 시그널 확인하고 싶다면?</Text>
        <Text style={styles.heading2}>회원가입을 축하드립니다!</Text>

        <View style={styles.divider} />

        <Text style={styles.subtext}>당신의 운동 습관에 대해 알려주세요</Text>

        <View style={styles.labelRow}>
          <Text style={styles.label}>주당 운동 횟수</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { code: "ZERO", label: "0회" },
            { code: "ONE_TO_TWO", label: "1~2회" },
            { code: "TWO_TO_THREE", label: "2~3회" },
            { code: "THREE_TO_FOUR", label: "3~4회" },
            { code: "FOUR_TO_FIVE", label: "4~5회" },
            { code: "DAILY", label: "매일" },
          ].map((item) => (
            <Chip
              key={item.code}
              label={item.label}
              selected={exerciseFrequency === item.code}
              onPress={() => setExerciseFrequency(item.code)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>선호 운동 장소</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { code: "GYM_FACILITY", label: "운동시설 위주" },
            { code: "HOME", label: "집" },
            { code: "OUTDOOR", label: "야외" },
            { code: "WORK_SCHOOL", label: "직장/학교" },
          ].map((item) => (
            <Chip
              key={item.code}
              label={item.label}
              selected={exercisePlace.includes(item.code)}
              onPress={() => toggleMulti(item.code, exercisePlace, setExercisePlace)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>선호 운동 종류</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="예: 유산소, 근력, 요가"
          value={exerciseType}
          onChangeText={setExerciseType}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>운동 시간</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { code: "UNDER_1H", label: "1시간 미만" },
            { code: "ONE_TO_TWO_H", label: "1~2시간" },
            { code: "TWO_TO_THREE_H", label: "2~3시간" },
            { code: "OVER_3H", label: "3시간 이상" },
          ].map((item) => (
            <Chip
              key={item.code}
              label={item.label}
              selected={exerciseDuration === item.code}
              onPress={() => setExerciseDuration(item.code)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>활동량 (하루 평균 걸음수)</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="몇 보를 걷는지 작성해주세요 ex) 4000"
          keyboardType="number-pad"
          value={avgSteps}
          onChangeText={setAvgSteps}
        />

        <View style={{ marginTop: 40 }}>
          <NextButton title="다음" onPress={handleNext} disabled={!canNext} />
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