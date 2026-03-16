import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
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

export default function Survey1Screen() {
  const router = useRouter();
  const { setAnswer } = useSurveyDraft();

  const [mealFrequency, setMealFrequency] = useState<string | null>(null);
  const [foodPreference, setFoodPreference] = useState<string[]>([]);
  const [sugarIntakeFreq, setSugarIntakeFreq] = useState<string | null>(null);
  const [caffeineIntake, setCaffeineIntake] = useState<string | null>(null);

  const toggleMulti = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const canNext = useMemo(() => {
    return !!(
      mealFrequency &&
      foodPreference.length > 0 &&
      sugarIntakeFreq &&
      caffeineIntake
    );
  }, [mealFrequency, foodPreference, sugarIntakeFreq, caffeineIntake]);

  const handleNext = () => {
    if (!canNext) return;

    setAnswer("MEAL_FREQUENCY", mealFrequency!);
    setAnswer("FOOD_PREFERENCE", foodPreference);
    setAnswer("SUGAR_INTAKE_FREQ", sugarIntakeFreq!);
    setAnswer("CAFFEINE_INTAKE", caffeineIntake!);

    router.push("/survey/survey2");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />

        <Text style={styles.heading}>나의 건강 시그널 확인하고 싶다면?</Text>
        <Text style={styles.heading2}>회원가입을 축하드립니다!</Text>

        <Text style={styles.subtext}>당신의 식습관에 대해 알려주세요</Text>

        <View style={styles.labelRow}>
          <Text style={styles.label}>하루 평균 식사 횟수</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { code: "ZERO", label: "0회" },
            { code: "ONE_TO_TWO", label: "1~2회" },
            { code: "TWO_TO_THREE", label: "2~3회" },
            { code: "THREE_TO_FOUR", label: "3~4회" },
            { code: "FOUR_TO_FIVE", label: "4~5회" },
          ].map((item) => (
            <Chip
              key={item.code}
              label={item.label}
              selected={mealFrequency === item.code}
              onPress={() => setMealFrequency(item.code)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>자주 먹는 음식 유형</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { code: "CARB_HEAVY", label: "탄수화물 위주" },
            { code: "PROTEIN_HEAVY", label: "단백질 위주" },
            { code: "PROCESSED_FOOD_HEAVY", label: "가공식품 위주" },
            { code: "VEGETARIAN", label: "채식" },
          ].map((item) => (
            <Chip
              key={item.code}
              label={item.label}
              selected={foodPreference.includes(item.code)}
              onPress={() => toggleMulti(item.code, foodPreference, setFoodPreference)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>단 음식 섭취 빈도</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {[
            { code: "NONE", label: "주 0회" },
            { code: "ONE_TO_TWO_PER_WEEK", label: "주 1~2회" },
            { code: "THREE_TO_FOUR_PER_WEEK", label: "주 3~4회" },
            { code: "FIVE_TO_SIX_PER_WEEK", label: "주 5~6회" },
            { code: "DAILY", label: "매일" },
          ].map((item) => (
            <Chip
              key={item.code}
              label={item.label}
              selected={sugarIntakeFreq === item.code}
              onPress={() => setSugarIntakeFreq(item.code)}
            />
          ))}
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label}>카페인 섭취</Text>
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
              selected={caffeineIntake === item.code}
              onPress={() => setCaffeineIntake(item.code)}
            />
          ))}
        </View>

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
  heading2: { marginTop: 5, fontSize: 20, fontWeight: "600", color: "#111" },
  subtext: { marginTop: 40, fontSize: 16, fontWeight: "500", color: "#111", marginBottom: 20 },
  labelRow: { flexDirection: "row", marginTop: 26 },
  label: { fontSize: 14, fontWeight: "500", color: "#111" },
  star: { fontSize: 13, color: "#e53935" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  chip: { paddingHorizontal: 13, height: 35, borderRadius: 18, backgroundColor: "#747474ff", justifyContent: "center" },
  chipSelected: { backgroundColor: "#1435b9f6" },
  chipText: { color: "#fff", fontSize: 14 },
  chipTextSelected: { fontWeight: "600" },
});