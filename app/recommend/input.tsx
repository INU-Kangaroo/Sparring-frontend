import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { createFoodLog, searchFoods } from "../api/foods";
import { getTodaySteps } from "../api/steps";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

type MealType = "아침" | "점심" | "저녁" | "간식";

type FoodEntry = {
  id: string;
  name: string;
  time: string;
  meal: MealType | null;
};

const MEAL_TYPES: MealType[] = ["아침", "점심", "저녁", "간식"];

const generateId = () => Math.random().toString(36).slice(2);

const MEAL_TIME_MAP: Record<MealType, string> = {
  아침: "BREAKFAST",
  점심: "LUNCH",
  저녁: "DINNER",
  간식: "SNACK",
};

function toIsoDateTime(date: Date, time: string) {
  const [hour = "00", minute = "00"] = time
    .split(":")
    .map((s) => s.padStart(2, "0"));
  const d = new Date(date);
  d.setHours(Number(hour));
  d.setMinutes(Number(minute));
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d.toISOString();
}

export default function InputScreen() {
  const [stepState, setStepState] = useState<{
    connected: boolean;
    totalSteps: number | null;
  }>({
    connected: false,
    totalSteps: null,
  });

  const [foods, setFoods] = useState<FoodEntry[]>([
    { id: generateId(), name: "", time: "", meal: null },
  ]);

  useEffect(() => {
    let mounted = true;

    const loadTodaySteps = async () => {
      try {
        const stepData = await getTodaySteps();
        if (!mounted) return;
        setStepState({
          connected: true,
          totalSteps:
            stepData?.totalSteps != null ? Number(stepData.totalSteps) : null,
        });
      } catch (error) {
        console.log("getTodaySteps error", error);
        if (!mounted) return;
        setStepState({
          connected: false,
          totalSteps: null,
        });
      }
    };

    loadTodaySteps();

    return () => {
      mounted = false;
    };
  }, []);

  const updateFood = (id: string, patch: Partial<FoodEntry>) =>
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const addFood = () =>
    setFoods((prev) => [...prev, { id: generateId(), name: "", time: "", meal: null }]);

  const removeFood = (id: string) =>
    setFoods((prev) => prev.filter((f) => f.id !== id));

  const handleSave = async () => {
    const today = new Date();

    try {
      if (foods.length === 0) throw new Error("식단이 없습니다.");

      for (const food of foods) {
        if (!food.name.trim() || !food.time.trim() || !food.meal) continue;

        const keyword = food.name.trim();
        const searchResults = await searchFoods(keyword, 0, 1);
        if (!Array.isArray(searchResults) || searchResults.length === 0) {
          console.warn("food not found for name", keyword);
          continue;
        }

        await createFoodLog({
          foodId: searchResults[0].id,
          mealTime: MEAL_TIME_MAP[food.meal],
          loggedAt: toIsoDateTime(today, food.time),
          eatenAmountGram: 100,
        });
      }

      Alert.alert("저장 완료", "식사 기록이 성공적으로 저장되었습니다.");
      router.push("/recommend/recommendation");
    } catch (error) {
      console.error("save food record error", error);
      Alert.alert(
        "저장 실패",
        error instanceof Error ? error.message : "기록 저장 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#222" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>오늘의 기록</Text>
            <Text style={styles.headerSub}>식사 기록과 운동 상태를 확인해주세요</Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionIntro}>
            <Text style={styles.sectionTitle}>식사 기록</Text>
            <Text style={styles.sectionBody}>
              추천은 식단 중심으로 진행돼요. 운동은 직접 입력 대신 걸음수 연동과 식후 걷기 실천 여부로 정리될 예정이에요.
            </Text>
          </View>

          <View>
            {foods.map((food, idx) => (
              <View key={food.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIndexBadge}>
                    <Text style={styles.cardIndexText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.cardLabel}>식사 기록</Text>
                  {foods.length > 1 && (
                    <Pressable onPress={() => removeFood(food.id)} style={styles.removeBtn}>
                      <Ionicons name="close-circle" size={20} color="#ddd" />
                    </Pressable>
                  )}
                </View>

                <Text style={styles.fieldLabel}>음식 이름</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예) 된장찌개, 현미밥"
                  placeholderTextColor="#ccc"
                  value={food.name}
                  onChangeText={(value) => updateFood(food.id, { name: value })}
                />

                <View style={styles.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>식사 시간</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="예) 08:30"
                      placeholderTextColor="#ccc"
                      value={food.time}
                      onChangeText={(value) => updateFood(food.id, { time: value })}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>식사 구분</Text>
                    <View style={styles.chipRowSmall}>
                      {MEAL_TYPES.map((meal) => (
                        <Pressable
                          key={meal}
                          onPress={() => updateFood(food.id, { meal })}
                          style={[
                            styles.chipSmall,
                            food.meal === meal && styles.chipSmallActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipSmallText,
                              food.meal === meal && styles.chipSmallTextActive,
                            ]}
                          >
                            {meal}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))}

            <Pressable onPress={addFood} style={styles.addBtn}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.light.primaryStrong} />
              <Text style={styles.addBtnText}>식사 추가</Text>
            </Pressable>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Ionicons name="walk-outline" size={20} color={Colors.light.primaryStrong} />
              <Text style={styles.activityTitle}>오늘의 운동</Text>
            </View>
            <Text style={styles.activityBody}>
              운동 직접 입력 UI는 제외되고, 앞으로는 걸음수 연동 상태와 식후 걷기 실천 여부를 중심으로 보여드릴 예정이에요.
            </Text>
            <View style={styles.activityMetricRow}>
              <View style={styles.activityMetric}>
                <Text style={styles.activityMetricLabel}>걸음수 연동 상태</Text>
                <Text style={styles.activityMetricValue}>
                  {stepState.connected ? "연동됨" : "연동 전"}
                </Text>
              </View>
              <View style={styles.activityMetric}>
                <Text style={styles.activityMetricLabel}>오늘 걸음수</Text>
                <Text style={styles.activityMetricValue}>
                  {stepState.totalSteps != null
                    ? `${stepState.totalSteps.toLocaleString()}보`
                    : "-"}
                </Text>
              </View>
            </View>
            <View style={[styles.activityMetric, styles.activityWideMetric]}>
              <Text style={styles.activityMetricLabel}>식후 걷기 실천 여부</Text>
              <Text style={styles.activityMetricValue}>기록 준비 중</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.saveBar}>
          <Pressable onPress={handleSave} style={{ borderRadius: 999 }}>
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryStrong]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveBtn}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.saveBtnText}>기록 저장하기</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.mutedBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.text,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.light.subtleText,
    marginTop: 2,
    fontWeight: "500",
  },
  scrollContent: {
    padding: 20,
  },
  sectionIntro: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.subtleText,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: Colors.light.primaryStrong,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  cardIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.light.primarySurface,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIndexText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.light.primaryStrong,
  },
  cardLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
  },
  removeBtn: {
    padding: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.subtleText,
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 12,
  },
  rowFields: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  chipRowSmall: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.light.mutedBackground,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipSmallActive: {
    backgroundColor: Colors.light.primarySurface,
    borderColor: Colors.light.primaryStrong,
  },
  chipSmallText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.subtleText,
  },
  chipSmallTextActive: {
    color: Colors.light.primaryStrong,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.light.lineStrong,
    paddingVertical: 14,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.primaryStrong,
  },
  activityCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    shadowColor: Colors.light.primaryStrong,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.light.text,
  },
  activityBody: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.subtleText,
  },
  activityMetricRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  activityMetric: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activityWideMetric: {
    marginTop: 10,
  },
  activityMetricLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.light.subtleText,
    marginBottom: 6,
  },
  activityMetricValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
  },
  saveBar: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: Colors.light.background,
  },
  saveBtn: {
    height: 52,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.light.card,
  },
});
