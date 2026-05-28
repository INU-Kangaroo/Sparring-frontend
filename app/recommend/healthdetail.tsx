import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

import {
  refreshExerciseRecommendation,
  ExerciseRequest,
  ExerciseResponse,
} from "../api/recommendation";

import Colors from "@/constants/Colors";
import RecommendationHeader from "./components/RecommendationHeader";
import RecommendationCard from "./components/RecommendationCard";
import RecommendationBottomSheet from "./components/RecommendationBottomSheet";

const MAX_OPEN_TOP = 110;

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
  const { height: screenHeight } = useWindowDimensions();
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
  const SHEET_BOTTOM = Math.max(160, screenHeight - 170);
  const [contentHeight, setContentHeight] = useState(0);
  const OPEN_CONTENT_MARGIN = 24;
  const OPEN_THRESHOLD = 8;
  const SHEET_CHROME_HEIGHT = 72;
  const openTop = Math.max(
    MAX_OPEN_TOP,
    //screenHeight - (contentHeight + SHEET_CHROME_HEIGHT) - OPEN_CONTENT_MARGIN
  );

  const top = useSharedValue(SHEET_BOTTOM);

  const startTop = useSharedValue(SHEET_BOTTOM);

  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    top.value = SHEET_BOTTOM;
  }, [SHEET_BOTTOM, top]);

  useAnimatedReaction(
    () => top.value,
    (v) => {
      runOnJS(setSheetOpen)(Math.abs(v - openTop) <= OPEN_THRESHOLD);
    }
  );

  const pan = Gesture.Pan()
    .onBegin(() => {
      startTop.value = top.value;
    })
    .onUpdate((e) => {
      const nextTop = startTop.value + e.translationY;

      top.value = Math.min(
        Math.max(nextTop, openTop),
        SHEET_BOTTOM
      );
    })
    .onEnd((e) => {
      const mid = (openTop + SHEET_BOTTOM) / 2;

      const shouldOpen =
        e.velocityY < -500 ? true : top.value < mid;

      top.value = withSpring(
        shouldOpen ? openTop : SHEET_BOTTOM,
        {
          damping: 18,
          stiffness: 180,
        }
      );
    });

  const sheetStyle = useAnimatedStyle(() => ({
    top: top.value,
  }));

  const openSheet = (item: WorkoutItem) => {
    setSelected(item);
    top.value = withSpring(openTop, {
      damping: 18,
      stiffness: 180,
    });
  };

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
      <RecommendationHeader
        title="운동"
        subtitle="현재 혈당 기반, 맞춤 운동 추천"
        onBack={() => router.push("/recommend/recommendation")}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* 운동 리스트 */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {data.map((item) => {
          const isActive = selected?.id === item.id;

          return (
            <RecommendationCard
              key={item.id}
              isActive={isActive}
              onPress={() => openSheet(item)}
              title={item.name}
              rightText={item.badgeText}
              subText={item.subInfo}
            />
          );
        })}

        <View style={{ height: 220 }} />
      </ScrollView>

      {/* Bottom Sheet */}
      {selected && (
        <RecommendationBottomSheet
          gesture={pan}
          animatedStyle={sheetStyle}
          sheetOpen={sheetOpen}
          contentBottomPadding={34}
          onContentHeightChange={setContentHeight}
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
        </RecommendationBottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.card,
  },

  listContent: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 4,
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 6,
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
    marginBottom: 8,
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
    backgroundColor: "rgba(205, 125, 132, 0.75)",
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
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  cautionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
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
    color: "#fff",
  },

  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "600",
    color: "#fff",
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
