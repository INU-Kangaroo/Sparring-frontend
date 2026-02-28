import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type MealType = "아침" | "점심" | "저녁" | "간식";
type Intensity = "가벼움" | "보통" | "격렬";

type FoodEntry = {
  id: string;
  name: string;
  time: string;
  meal: MealType | null;
};

type WorkoutEntry = {
  id: string;
  name: string;
  time: string;
  duration: string;
  intensity: Intensity | null;
};

const MEAL_TYPES: MealType[] = ["아침", "점심", "저녁", "간식"];
const INTENSITIES: Intensity[] = ["가벼움", "보통", "격렬"];

const generateId = () => Math.random().toString(36).slice(2);

export default function InputScreen() {
  const [tab, setTab] = useState<"food" | "workout">("food");

  const [foods, setFoods] = useState<FoodEntry[]>([
    { id: generateId(), name: "", time: "", meal: null },
  ]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([
    { id: generateId(), name: "", time: "", duration: "", intensity: null },
  ]);

  // ── Food helpers ──────────────────────────────────────────
  const updateFood = (id: string, patch: Partial<FoodEntry>) =>
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const addFood = () =>
    setFoods((prev) => [
      ...prev,
      { id: generateId(), name: "", time: "", meal: null },
    ]);

  const removeFood = (id: string) =>
    setFoods((prev) => prev.filter((f) => f.id !== id));

  // ── Workout helpers ───────────────────────────────────────
  const updateWorkout = (id: string, patch: Partial<WorkoutEntry>) =>
    setWorkouts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...patch } : w))
    );

  const addWorkout = () =>
    setWorkouts((prev) => [
      ...prev,
      { id: generateId(), name: "", time: "", duration: "", intensity: null },
    ]);

  const removeWorkout = (id: string) =>
    setWorkouts((prev) => prev.filter((w) => w.id !== id));

  const handleSave = () => {
    // TODO: 저장 로직 연결
    router.push("/recommend/recommendation");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#222" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>오늘의 기록</Text>
            <Text style={styles.headerSub}>식단과 운동을 입력해주세요</Text>
          </View>
        </View>

        {/* 탭 */}
        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tabBtn, tab === "food" && styles.tabBtnActive]}
            onPress={() => setTab("food")}
          >
            <Ionicons
              name="restaurant-outline"
              size={16}
              color={tab === "food" ? "#fff" : "#aaa"}
            />
            <Text
              style={[styles.tabText, tab === "food" && styles.tabTextActive]}
            >
              식단
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, tab === "workout" && styles.tabBtnActive]}
            onPress={() => setTab("workout")}
          >
            <Ionicons
              name="barbell-outline"
              size={16}
              color={tab === "workout" ? "#fff" : "#aaa"}
            />
            <Text
              style={[
                styles.tabText,
                tab === "workout" && styles.tabTextActive,
              ]}
            >
              운동
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── 식단 탭 ── */}
          {tab === "food" && (
            <View>
              {foods.map((food, idx) => (
                <View key={food.id} style={styles.card}>
                  {/* 카드 헤더 */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIndexBadge}>
                      <Text style={styles.cardIndexText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.cardLabel}>식사 기록</Text>
                    {foods.length > 1 && (
                      <Pressable
                        onPress={() => removeFood(food.id)}
                        style={styles.removeBtn}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#ddd"
                        />
                      </Pressable>
                    )}
                  </View>

                  {/* 음식 이름 */}
                  <Text style={styles.fieldLabel}>음식 이름</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="예) 된장찌개, 현미밥"
                    placeholderTextColor="#ccc"
                    value={food.name}
                    onChangeText={(v) => updateFood(food.id, { name: v })}
                  />

                  {/* 식사 시간 + 구분 */}
                  <View style={styles.rowFields}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>식사 시간</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="예) 08:30"
                        placeholderTextColor="#ccc"
                        value={food.time}
                        onChangeText={(v) => updateFood(food.id, { time: v })}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>식사 구분</Text>
                      <View style={styles.chipRowSmall}>
                        {MEAL_TYPES.map((m) => (
                          <Pressable
                            key={m}
                            onPress={() => updateFood(food.id, { meal: m })}
                            style={[
                              styles.chipSmall,
                              food.meal === m && styles.chipSmallActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipSmallText,
                                food.meal === m && styles.chipSmallTextActive,
                              ]}
                            >
                              {m}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              {/* 추가 버튼 */}
              <Pressable onPress={addFood} style={styles.addBtn}>
                <Ionicons name="add-circle-outline" size={20} color="#5A80FF" />
                <Text style={styles.addBtnText}>식사 추가</Text>
              </Pressable>
            </View>
          )}

          {/* ── 운동 탭 ── */}
          {tab === "workout" && (
            <View>
              {workouts.map((workout, idx) => (
                <View key={workout.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIndexBadge}>
                      <Text style={styles.cardIndexText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.cardLabel}>운동 기록</Text>
                    {workouts.length > 1 && (
                      <Pressable
                        onPress={() => removeWorkout(workout.id)}
                        style={styles.removeBtn}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#ddd"
                        />
                      </Pressable>
                    )}
                  </View>

                  {/* 운동 종류 */}
                  <Text style={styles.fieldLabel}>운동 종류</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="예) 러닝, 수영, 헬스"
                    placeholderTextColor="#ccc"
                    value={workout.name}
                    onChangeText={(v) => updateWorkout(workout.id, { name: v })}
                  />

                  {/* 운동 시간 + 시간(분) */}
                  <View style={styles.rowFields}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>운동 시작 시간</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="예) 19:00"
                        placeholderTextColor="#ccc"
                        value={workout.time}
                        onChangeText={(v) =>
                          updateWorkout(workout.id, { time: v })
                        }
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>운동 시간 (분)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="예) 30"
                        placeholderTextColor="#ccc"
                        value={workout.duration}
                        onChangeText={(v) =>
                          updateWorkout(workout.id, { duration: v })
                        }
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  {/* 운동 강도 */}
                  <Text style={styles.fieldLabel}>운동 강도</Text>
                  <View style={styles.chipRow}>
                    {INTENSITIES.map((intensity) => (
                      <Pressable
                        key={intensity}
                        onPress={() =>
                          updateWorkout(workout.id, { intensity })
                        }
                        style={[
                          styles.chip,
                          workout.intensity === intensity && styles.chipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            workout.intensity === intensity &&
                              styles.chipTextActive,
                          ]}
                        >
                          {intensity === "가벼움"
                            ? "🚶 가벼움"
                            : intensity === "보통"
                            ? "🏃 보통"
                            : "🔥 격렬"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}

              <Pressable onPress={addWorkout} style={styles.addBtn}>
                <Ionicons name="add-circle-outline" size={20} color="#5A80FF" />
                <Text style={styles.addBtnText}>운동 추가</Text>
              </Pressable>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* 저장 버튼 */}
        <View style={styles.saveBar}>
          <Pressable onPress={handleSave} style={{ borderRadius: 999 }}>
            <LinearGradient
              colors={["#0D99FF", "#1D4BFF"]}
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
    backgroundColor: "#F8F9FF",
  },

  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  headerSub: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
    fontWeight: "500",
  },

  // 탭
  tabRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F4F4F4",
  },
  tabBtnActive: {
    backgroundColor: "#1D4BFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#aaa",
  },
  tabTextActive: {
    color: "#fff",
  },

  // 스크롤
  scrollContent: {
    padding: 20,
  },

  // 카드
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#4060FF",
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
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIndexText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#5A80FF",
  },
  cardLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  removeBtn: {
    padding: 2,
  },

  // 필드
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#F8F9FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#222",
    borderWidth: 1,
    borderColor: "#ECEEFF",
    marginBottom: 12,
  },
  rowFields: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  // 칩
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  chipActive: {
    backgroundColor: "#EEF3FF",
    borderColor: "#5A80FF",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#aaa",
  },
  chipTextActive: {
    color: "#1D4BFF",
  },

  // 작은 칩 (식사 구분)
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
    backgroundColor: "#F4F4F4",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  chipSmallActive: {
    backgroundColor: "#EEF3FF",
    borderColor: "#5A80FF",
  },
  chipSmallText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#aaa",
  },
  chipSmallTextActive: {
    color: "#1D4BFF",
  },

  // 추가 버튼
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E4ECFF",
    borderStyle: "dashed",
    backgroundColor: "#F6F8FF",
    marginBottom: 4,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5A80FF",
  },

  // 저장 바
  saveBar: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: "#1D4BFF",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
});