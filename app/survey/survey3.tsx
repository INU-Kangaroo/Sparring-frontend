import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from "react-native";
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

export default function Survey3Screen() {
  const router = useRouter();

  const [sleepHours, setSleepHours] = useState<string>("");          // 평균 수면 시간 (입력)
  const [sleepQuality, setSleepQuality] = useState<string | null>(null); // 수면의 질
  const [smoking, setSmoking] = useState<string | null>(null);       // 흡연 여부
  const [drinking, setDrinking] = useState<string | null>(null);     // 음주 빈도
  const [stress, setStress] = useState<string | null>(null);         // 스트레스 수준

  const canNext = useMemo(() => {
    return !!(sleepHours.trim() && sleepQuality && smoking && drinking && stress);
  }, [sleepHours, sleepQuality, smoking, drinking, stress]);

  const handleNext = () => {
    if (!canNext) return;

    // TODO: 저장 (zustand/컨텍스트/서버/params 등)
    router.replace("/main/main"); // 필요하면 다음 경로로 변경
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />

        <Text style={styles.heading}>나의 건강 시그널 확인하고 싶다면?</Text>
        <Text style={styles.heading2}>회원가입을 축하드립니다!</Text>

        <View style={styles.divider} />

        <Text style={styles.subtext}>당신의 생활 습관에 대해 알려주세요</Text>

        {/* 평균 수면 시간 */}
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

        {/* 수면의 질 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>수면의 질</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {["좋음", "보통", "나쁨"].map((item) => (
            <Chip key={item} label={item} selected={sleepQuality === item} onPress={() => setSleepQuality(item)} />
          ))}
        </View>

        {/* 흡연 여부 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>흡연 여부</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {["예", "아니오"].map((item) => (
            <Chip key={item} label={item} selected={smoking === item} onPress={() => setSmoking(item)} />
          ))}
        </View>

        {/* 음주 빈도 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>음주 빈도</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {["없음", "주 1~2회", "주 3회 이상"].map((item) => (
            <Chip key={item} label={item} selected={drinking === item} onPress={() => setDrinking(item)} />
          ))}
        </View>

        {/* 스트레스 수준 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>스트레스 수준</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {["낮음", "중간", "높음"].map((item) => (
            <Chip key={item} label={item} selected={stress === item} onPress={() => setStress(item)} />
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
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
  },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginTop: 16,
  },
  subtext: {
    marginTop: 22,
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
    marginBottom: 10,
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
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 18,
    backgroundColor: "#747474",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: "#3C3C3C",
  },
  chipText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextSelected: {
    fontWeight: "700",
  },
  input: {
    marginTop: 12,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#111",
  },
});
