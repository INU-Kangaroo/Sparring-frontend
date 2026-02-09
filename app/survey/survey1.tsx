import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import BackButton from "../../components/BackButton";
import NextButton from "../../components/NextButton";

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

  const [meals, setMeals] = useState<string | null>(null);
  const [foodType, setFoodType] = useState<string | null>(null);
  const [snackFreq, setSnackFreq] = useState<string | null>(null);
  const [caffeine, setCaffeine] = useState<string | null>(null);

  const canNext = useMemo(() => {
    return !!(meals && foodType && snackFreq && caffeine);
  }, [meals, foodType, snackFreq, caffeine]);

  const handleNext = () => {
    if (!canNext) return;

    // TODO: 여기서 설문값 저장/전달 가능
    router.push("/survey/survey2");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />

        <Text style={styles.heading}>나의 건강 시그널 확인하고 싶다면?</Text>
        <Text style={styles.heading2}>회원가입을 축하드립니다!</Text>

        <Text style={styles.subtext}>당신의 식습관에 대해 알려주세요</Text>

        {/* 1) 하루 평균 식사 횟수 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>하루 평균 식사 횟수</Text>
          <Text style={styles.star}> *</Text>
        </View>

        <View style={styles.chipRow}>
          {["0회", "1~2회", "2~3회", "3~4회", "4~5회"].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={meals === item}
              onPress={() => setMeals(item)}
            />
          ))}
        </View>

        {/* 2) 자주 먹는 음식 유형 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>자주 먹는 음식 유형</Text>
          <Text style={styles.star}> *</Text>
        </View>

        <View style={styles.chipRow}>
          {["탄수화물 위주", "단백질 위주", "가공식품 위주", "채식"].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={foodType === item}
              onPress={() => setFoodType(item)}
            />
          ))}
        </View>

        {/* 3) 단 음식 섭취 빈도 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>단 음식 섭취 빈도</Text>
          <Text style={styles.star}> *</Text>
        </View>

        <View style={styles.chipRow}>
          {["주 0회", "주 1~2회", "주 3~4회", "주 5~6회", "매일"].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={snackFreq === item}
              onPress={() => setSnackFreq(item)}
            />
          ))}
        </View>

        {/* 4) 카페인 섭취 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>카페인 섭취</Text>
          <Text style={styles.star}> *</Text>
        </View>

        <View style={styles.chipRow}>
          {["예", "아니오"].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={caffeine === item}
              onPress={() => setCaffeine(item)}
            />
          ))}
        </View>

        {/* Next */}
        <View style={{ marginTop: 40 }}>
          <NextButton title="다음" onPress={handleNext} disabled={!canNext} />
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 40,
    backgroundColor: "#fff",
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
    fontWeight: "600",
    color: "#111",
  },
  subtext: {
    marginTop: 40,
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    marginTop: 26,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
  },
  star: {
    fontSize: 13,
    color: "#e53935",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 13,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#747474ff",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: "#373636ff",
  },
  chipText: {
    color: "#fff",
    fontSize: 14,
  },
  chipTextSelected: {
    fontWeight: "600",
  },
});
