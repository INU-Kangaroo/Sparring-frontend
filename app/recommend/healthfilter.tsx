import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  fetchExerciseRecommendation,
  ExerciseRequest,
} from "../api/recommendation";

import Colors from "@/constants/Colors";

type Option = {
  id: string;
  label: string;
};

const PRETENDARD = "Pretendard";
const PRETENDARD_MEDIUM = "Pretendard-Medium";

const DURATION_MAP: Record<string, ExerciseRequest["duration"]> = {
  under30: "SHORT",
  "30to60": "MEDIUM",
  over60: "LONG",
};

const INTENSITY_MAP: Record<string, ExerciseRequest["intensity"]> = {
  low: "LOW",
  mid: "MODERATE",
  high: "HIGH",
};

const LOCATION_MAP: Record<string, ExerciseRequest["location"]> = {
  indoor: "INDOOR",
  outdoor: "OUTDOOR",
  gym: "GYM",
};

function getApiErrorMessage(error: unknown) {
  const status = (error as any)?.response?.status;
  const responseData = (error as any)?.response?.data;
  const message = (error as any)?.message;

  if (status) {
    const detail =
      responseData?.message ??
      responseData?.errors ??
      JSON.stringify(responseData ?? {});

    return `활동 추천 호출 실패 (${status})\n${detail}`;
  }

  return `활동 추천 호출 실패\n${String(message ?? error)}`;
}

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
      style={[
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          active ? styles.chipTextActive : styles.chipTextInactive,
        ]}
      >
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

  const [selectedTime, setSelectedTime] = useState<string>("30to60");
  const [selectedIntensity, setSelectedIntensity] =
    useState<string>("mid");
  const [selectedPlace, setSelectedPlace] =
    useState<string>("indoor");

  const [loading, setLoading] = useState(false);

  const canSave =
    selectedTime !== "" &&
    selectedIntensity !== "" &&
    selectedPlace !== "";

  const onSave = async () => {
    if (!canSave || loading) return;

    setLoading(true);

    try {
      const result = await fetchExerciseRecommendation({
        duration: DURATION_MAP[selectedTime],
        intensity: INTENSITY_MAP[selectedIntensity],
        location: LOCATION_MAP[selectedPlace],
      });

      router.push({
        pathname: "/recommend/healthdetail",
        params: {
          data: JSON.stringify(result),
          duration: DURATION_MAP[selectedTime],
          intensity: INTENSITY_MAP[selectedIntensity],
          location: LOCATION_MAP[selectedPlace],
        },
      });
    } catch (e) {
      console.error("exercise recommendation error", e);

      Alert.alert("오류", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color="#111"
              />
            </Pressable>

            <Text style={styles.title}>활동 추천 필터</Text>
          </View>

          <Text style={styles.subtitle}>
            원하는 활동 조건을 선택하고 추천을 받아보세요
          </Text>

          {/* 활동 시간 */}
          <Text style={styles.question}>
            원하는 활동 시간을 골라주세요.
          </Text>

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

          {/* 활동 강도 */}
          <Text style={[styles.question, styles.sectionSpacing]}>
            원하는 활동 강도를 골라주세요.
          </Text>

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

          {/* 활동 장소 */}
          <Text style={[styles.question, styles.sectionSpacing]}>
            원하는 활동 장소를 골라주세요.
          </Text>

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

          {/* 버튼 */}
          <Pressable
            onPress={onSave}
            disabled={!canSave || loading}
            style={[
              styles.saveBtn,
              !canSave
                ? styles.saveBtnDisabled
                : styles.saveBtnEnabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={[
                  styles.saveText,
                  !canSave && styles.saveTextDisabled,
                ]}
              >
                저장
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingBottom: 60,
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingTop: 60,
  },

  headerRow: {
    marginTop: 23,
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  title: {
    fontSize: 25,
    color: "#000000",
    fontFamily: PRETENDARD,
    fontWeight: "800",
  },

  subtitle: {
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 70,
    fontSize: 14,
    lineHeight: 24,
    color: "#8C8C8C",
    fontFamily: PRETENDARD_MEDIUM,
  },

  question: {
    fontSize: 16,
    color: "#000000",
    fontFamily: PRETENDARD_MEDIUM,
  },

  sectionSpacing: {
    marginTop: 50,
  },

  row: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  chip: {
    width: 100,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  chipInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  chipActive: {
    backgroundColor: Colors.light.primaryStrong,
  },

  chipText: {
    fontSize: 15,
    fontFamily: PRETENDARD_MEDIUM,
  },

  chipTextInactive: {
    color: "#000000",
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  saveBtn: {
    marginTop: 100,
    alignSelf: "center",
    width: 140,
    height: 48,
    borderRadius: 16,
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
    opacity: 0.7,
  },
});