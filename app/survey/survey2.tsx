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

export default function Survey2Screen() {
  const router = useRouter();

  const [workoutFreq, setWorkoutFreq] = useState<string | null>(null);     // 주당 운동 횟수
  const [preferredPlace, setPreferredPlace] = useState<string | null>(null); // 선호 운동 장소
  const [workoutType, setWorkoutType] = useState<string | null>(null);     // 선호 운동 종류
  const [workoutTime, setWorkoutTime] = useState<string | null>(null);     // 운동 시간(여부)
  const [steps, setSteps] = useState<string>("");                          // 활동량(걸음수)

  const canNext = useMemo(() => {
    return !!(workoutFreq && preferredPlace && workoutType && workoutTime && steps.trim().length > 0);
  }, [workoutFreq, preferredPlace, workoutType, workoutTime, steps]);

  const handleNext = () => {
    if (!canNext) return;

    // TODO: 저장 (zustand/컨텍스트/서버/params 등)
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

        {/* 주당 운동 횟수 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>주당 운동 횟수</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {["0회", "1~2회", "2~3회", "3~4회", "4~5회"].map((item) => (
            <Chip key={item} label={item} selected={workoutFreq === item} onPress={() => setWorkoutFreq(item)} />
          ))}
        </View>

        {/* 선호 운동 장소 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>선호 운동 장소</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {["헬스장", "집", "야외", "기타"].map((item) => (
            <Chip key={item} label={item} selected={preferredPlace === item} onPress={() => setPreferredPlace(item)} />
          ))}
        </View>

        {/* 선호 운동 종류 */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>선호 운동 종류</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {["유산소", "근력", "요가/필라테스", "스포츠", "기타"].map((item) => (
            <Chip key={item} label={item} selected={workoutType === item} onPress={() => setWorkoutType(item)} />
          ))}
        </View>

        {/* 운동 시간  */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>운동 시간</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <View style={styles.chipRow}>
          {["1-2시간", "2-3시간", "3-4시간", "4시간 이상"].map((item) => (
            <Chip key={item} label={item} selected={workoutTime === item} onPress={() => setWorkoutTime(item)} />
          ))}
        </View>

        {/* 활동량(걸음수) */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>활동량 (하루 평균 걸음수)</Text>
          <Text style={styles.star}> *</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="몇 보를 걷는지 작성해주세요 ex) 4000"
          keyboardType="number-pad"
          value={steps}
          onChangeText={setSteps}
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
