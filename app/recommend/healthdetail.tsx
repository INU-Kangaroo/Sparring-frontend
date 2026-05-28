import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

import {
  refreshExerciseRecommendation,
  ExerciseRequest,
  ExerciseResponse,
} from "../api/recommendation";

import Colors from "@/constants/Colors";

const { height: H } = Dimensions.get("window");

const SHEET_TOP = 110;
const SHEET_BOTTOM = H - 170;

type WorkoutItem = {
  id: string;
  name: string;
  subInfo: string;
  badgeText: string;
  precautions: string[];
  sections: {
    id: string;
    title: string;
    rows: { id: string; label: string; value: string }[];
  }[];
};

function mapApiToItems(res: ExerciseResponse): WorkoutItem[] {
  const cardiacItems: WorkoutItem[] = res.cardiacExercises.map((e, idx) => ({
    id: `cardiac-${idx}`,
    name: e.name,
    subInfo: e.duration,
    badgeText: `${e.minCalories}~${e.maxCalories}kcal`,
    precautions: e.precautions,
    sections: [
      {
        id: "s1",
        title: "유산소 운동",
        rows: [
          { id: "r1", label: "권장 시간", value: e.duration },
          {
            id: "r2",
            label: "칼로리 소모",
            value: `${e.minCalories}~${e.maxCalories}kcal`,
          },
        ],
      },
    ],
  }));

  const strengthItems: WorkoutItem[] = res.strengthExercises.map((e, idx) => ({
    id: `strength-${idx}`,
    name: e.name,
    subInfo: `${e.duration} | ${e.frequency}`,
    badgeText: e.frequency,
    precautions: e.precautions,
    sections: [
      {
        id: "s1",
        title: "근력 운동",
        rows: [
          { id: "r1", label: "운동 시간", value: e.duration },
          { id: "r2", label: "권장 횟수", value: e.frequency },
        ],
      },
    ],
  }));

  return [...cardiacItems, ...strengthItems];
}

function WorkoutRowBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.workoutRow}>
      <Text style={styles.workoutLabel}>{label}</Text>
      <Text style={styles.workoutValue}>{value}</Text>
    </View>
  );
}

function PrecautionBox({ bullets }: { bullets: string[] }) {
  return (
    <View style={styles.cautionBox}>
      <Text style={styles.cautionTitle}>참고 포인트</Text>

      <View style={{ marginTop: 10, gap: 8 }}>
        {bullets.map((b, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{b}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function HealthDetail() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    data: string;
    duration: string;
    intensity: string;
    location: string;
  }>();

  const filterBody: ExerciseRequest = {
    duration: (params.duration ?? "MEDIUM") as ExerciseRequest["duration"],
    intensity: (params.intensity ?? "MODERATE") as ExerciseRequest["intensity"],
    location: (params.location ?? "INDOOR") as ExerciseRequest["location"],
  };

  const initialData = useMemo<WorkoutItem[]>(() => {
    try {
      const parsed: ExerciseResponse = JSON.parse(params.data ?? "{}");

      const items = mapApiToItems(parsed);

      return items.length > 0 ? items : [];
    } catch {
      return [];
    }
  }, [params.data]);

  const [data, setData] = useState<WorkoutItem[]>(initialData);

  const [selected, setSelected] = useState<WorkoutItem | null>(
    initialData[0] ?? null
  );

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      const res = await refreshExerciseRecommendation(filterBody);

      const mapped = mapApiToItems(res);

      setData(mapped);

      if (mapped.length > 0) {
        setSelected(mapped[0]);
      }
    } catch {
      alert("새로고침에 실패했어요. 다시 시도해주세요.");
    } finally {
      setRefreshing(false);
    }
  };

  // Bottom Sheet
  const top = useSharedValue(SHEET_BOTTOM);

  const startTop = useSharedValue(SHEET_BOTTOM);

  const [sheetOpen, setSheetOpen] = useState(false);

  useAnimatedReaction(
    () => top.value,
    (v) => {
      runOnJS(setSheetOpen)(Math.abs(v - SHEET_TOP) < 10);
    }
  );

  const pan = Gesture.Pan()
    .onBegin(() => {
      startTop.value = top.value;
    })
    .onUpdate((e) => {
      const nextTop = startTop.value + e.translationY;

      top.value = Math.min(
        Math.max(nextTop, SHEET_TOP),
        SHEET_BOTTOM
      );
    })
    .onEnd((e) => {
      const mid = (SHEET_TOP + SHEET_BOTTOM) / 2;

      const shouldOpen =
        e.velocityY < -500 ? true : top.value < mid;

      top.value = withSpring(
        shouldOpen ? SHEET_TOP : SHEET_BOTTOM,
        {
          damping: 18,
          stiffness: 180,
        }
      );
    });

  const sheetStyle = useAnimatedStyle(() => ({
    top: top.value,
  }));

  if (data.length === 0) {
    return (
      <View
        style={[
          styles.safe,
          {
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Ionicons
          name="fitness-outline"
          size={48}
          color="#ccc"
        />

        <Text
          style={{
            marginTop: 16,
            color: "#888",
            fontSize: 15,
          }}
        >
          추천 운동이 없어요
        </Text>

        <Pressable
          onPress={() => router.back()}
          style={styles.emptyBackBtn}
        >
          <Text style={styles.emptyBackText}>
            필터 다시 선택
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.safe,
        {
          paddingTop: insets.top + 40,
        },
      ]}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.leftHeader}>
            <Pressable
              onPress={() =>
                router.push("/recommend/recommendation")
              }
              style={styles.backBtn}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color="#111"
              />
            </Pressable>

            <Text style={styles.headerTitle}>운동</Text>
          </View>

          <Pressable
            onPress={handleRefresh}
            style={styles.refreshBtn}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color={Colors.light.primaryStrong}
              />
            ) : (
              <Ionicons
                name="refresh"
                size={20}
                color={Colors.light.primaryStrong}
              />
            )}
          </Pressable>
        </View>

        <Text style={styles.h2}>
         현재 혈당 기반, 맞춤 운동 추천
        </Text>
      </View>

      {/* 운동 리스트 */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {data.map((item) => {
          const isActive = selected?.id === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => setSelected(item)}
              style={({ pressed }) => [
                pressed && { opacity: 0.85 },
              ]}
            >
              {isActive ? (
                <LinearGradient
                  colors={[
                    Colors.light.primary,
                    Colors.light.primaryStrong,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnActive}
                >
                  <View style={styles.btnRow}>
                    <Text style={styles.btnNameActive}>
                      {item.name}
                    </Text>

                    <Text style={styles.btnKcalActive}>
                      {item.badgeText}
                    </Text>
                  </View>

                  <Text style={styles.btnInfoActive}>
                    {item.subInfo}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.btnInactive}>
                  <View style={styles.btnRow}>
                    <Text style={styles.btnName}>
                      {item.name}
                    </Text>

                    <Text style={styles.btnKcal}>
                      {item.badgeText}
                    </Text>
                  </View>

                  <Text style={styles.btnInfo}>
                    {item.subInfo}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}

        <View style={{ height: 220 }} />
      </ScrollView>

      {/* Bottom Sheet */}
      {selected && (
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[styles.sheet, sheetStyle]}
          >
            <LinearGradient
              colors={[
                Colors.light.primaryMuted,
                Colors.light.primarySurfaceStrong,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sheetGradient}
            >
              <View style={styles.sheetHandle} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEnabled={sheetOpen}
                nestedScrollEnabled
                contentContainerStyle={
                  styles.sheetScrollContent
                }
              >
                <Text style={styles.sheetTitle}>
                  {selected.name}
                </Text>

                <Text style={styles.sheetKcal}>
                  {selected.badgeText}
                </Text>

                <Text style={styles.sheetInfo}>
                  {selected.subInfo}
                </Text>

                <View style={styles.divider} />

                {/* 운동 정보 */}
                {selected.sections.map((sec, idx) => (
                  <View
                    key={sec.id}
                    style={styles.section}
                  >
                    <Text style={styles.sectionTitle}>
                      {sec.title}
                    </Text>

                    <View style={styles.rowsWrap}>
                      {sec.rows.map((r) => (
                        <WorkoutRowBlock
                          key={r.id}
                          label={r.label}
                          value={r.value}
                        />
                      ))}
                    </View>

                    {idx !==
                      selected.sections.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}

                {/* 주의사항 */}
                {selected.precautions.length > 0 && (
                  <>
                    <View style={styles.divider} />

                    <PrecautionBox
                      bullets={selected.precautions}
                    />
                  </>
                )}

                <View style={{ height: 140 }} />
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.card,
  },

  header: {
    paddingHorizontal: 24,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
  },

  backBtn: {
    paddingRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.primarySurface,
    alignItems: "center",
    justifyContent: "center",
  },

  h2: {
    marginLeft: 10,
    marginBottom: 20,
    fontSize: 15,
    color: Colors.light.subtleText,
  },

  listContent: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 4,
  },

  btnActive: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: Colors.light.primaryStrong,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  btnNameActive: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    lineHeight: 22,
  },

  btnKcalActive: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
    marginLeft: 12,
  },

  btnInfoActive: {
    marginTop: 5,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  btnInactive: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  btnName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    flex: 1,
    lineHeight: 22,
  },

  btnKcal: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    flexShrink: 0,
    marginLeft: 12,
  },

  btnInfo: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // BottomSheet
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    maxHeight: H - 80,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  sheetGradient: {
    flex: 1,
    paddingTop: 10,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 90,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.9)",
    marginBottom: 22,
  },

  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },

  sheetKcal: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 4,
  },

  sheetInfo: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginBottom: 18,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginVertical: 18,
  },

  section: {
    paddingTop: 6,
    paddingBottom: 14,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 14,
  },

  rowsWrap: {
    gap: 10,
  },

  workoutRow: {
    borderRadius: 20,
    backgroundColor: Colors.light.primaryStrong,
    paddingHorizontal: 18,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  workoutLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  workoutValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },

  cautionBox: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#D99197",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  cautionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 2,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  bulletDot: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },

  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
  },

  emptyBackBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryStrong,
  },

  emptyBackText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});