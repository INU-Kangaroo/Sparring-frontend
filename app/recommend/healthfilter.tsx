import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";

type Option = { id: string; label: string };

const PRETENDARD = "Pretendard";
const PRETENDARD_MEDIUM = "Pretendard-Medium";

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function HealthFilter() {
  const timeOptions = useMemo<Option[]>(
    () => [
      { id: "under30", label: "30분 이하" },
      { id: "30to60", label: "30분~1시간" },
      { id: "over60", label: "1시간 이상" },
    ],
    []
  );

  const intensityOptions = useMemo<Option[]>(
    () => [
      { id: "low", label: "저강도" },
      { id: "mid", label: "중강도" },
      { id: "high", label: "고강도" },
    ],
    []
  );

  const placeOptions = useMemo<Option[]>(
    () => [
      { id: "indoor", label: "실내" },
      { id: "outdoor", label: "야외" },
      { id: "gym", label: "헬스장" },
    ],
    []
  );

  // ✅ 각 질문당 하나만 선택
  const [selectedTime, setSelectedTime] = useState<string>("30to60"); // 이미지처럼 기본값 주고 싶으면 유지
  const [selectedIntensity, setSelectedIntensity] = useState<string>(""); // 기본값 없음
  const [selectedPlace, setSelectedPlace] = useState<string>(""); // 기본값 없음

  const canSave = selectedTime !== "" && selectedIntensity !== "" && selectedPlace !== "";

  const onSave = () => {
    if (!canSave) return;
    router.push("/recommend/recommendation");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>필터 선택하기</Text>
      <Text style={styles.subtitle}>필터 선택하기</Text>

      <View style={{ height: 78 }} />

      {/* 1) 운동 시간대 */}
      <Text style={styles.question}>원하는 운동 시간대를 골라주세요.</Text>
      <View style={styles.row}>
        {timeOptions.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            active={selectedTime === o.id}
            onPress={() => setSelectedTime(o.id)}
          />
        ))}
      </View>

      {/* 2) 운동 강도 */}
      <Text style={[styles.question, { marginTop: 22 }]}>원하는 운동 강도를 골라주세요.</Text>
      <View style={styles.row}>
        {intensityOptions.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            active={selectedIntensity === o.id}
            onPress={() => setSelectedIntensity(o.id)}
          />
        ))}
      </View>

      {/* 3) 운동 장소 */}
      <Text style={[styles.question, { marginTop: 22 }]}>원하는 운동 장소를 골라주세요.</Text>
      <View style={styles.row}>
        {placeOptions.map((o) => (
          <Chip
            key={o.id}
            label={o.label}
            active={selectedPlace === o.id}
            onPress={() => setSelectedPlace(o.id)}
          />
        ))}
      </View>

      {/* 저장 버튼 (비활성/활성) */}
      <Pressable
        onPress={onSave}
        disabled={!canSave}
        style={[styles.saveBtn, !canSave ? styles.saveBtnDisabled : styles.saveBtnEnabled]}
      >
        <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>저장</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 22,
    paddingTop: 60,
  },

  title: {
    fontSize: 25,
    color: "#000000",
    fontFamily: PRETENDARD,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 18,
    color: "#000000",
    fontFamily: PRETENDARD_MEDIUM,
  },

  question: {
    fontSize: 16,
    color: "#000000",
    fontFamily: PRETENDARD_MEDIUM,
  },

  row: {
    marginTop: 16,
    flexDirection: "row",
    gap: 14,
    justifyContent: "flex-start",
  },

  // 칩: (foodfilter와 동일 톤)
  chip: {
    width: 90,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chipInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  chipActive: {
    backgroundColor: "#0D99FF",
  },

  chipText: {
    fontSize: 15,
    fontFamily: PRETENDARD_MEDIUM,
  },
  chipTextInactive: { color: "#000000" },
  chipTextActive: { color: "#FFFFFF" },

  // 저장 버튼: W129 H44 radius20
  saveBtn: {
    position: "absolute",
    bottom: 34,
    alignSelf: "center",
    width: 129,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnEnabled: {
    backgroundColor: "#3D3D3D",
  },
  saveBtnDisabled: {
    backgroundColor: "#D9D9D9",
  },
  saveText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: PRETENDARD_MEDIUM,
  },
  saveTextDisabled: {
    color: "#FFFFFF",
    opacity: 0.7,
  },
});
