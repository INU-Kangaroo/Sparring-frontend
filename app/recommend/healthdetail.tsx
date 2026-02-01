// healthdetail.tsx (또는 네가 쓰는 파일명 그대로)
// Diet 화면이랑 "완전 같은 구조" + 운동 데이터/레이아웃만 바꾼 버전

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const { height: H } = Dimensions.get("window");

// 상단 카드(리스트) 스펙
const CARD_W = 339;
const CARD_H = 67;
const CARD_R = 15;

// 바텀시트 위치
const SHEET_TOP = 120;
const SHEET_BOTTOM = H - 300;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

type WorkoutCard = {
  id: string;
  name: string;
  kcal: number;
  info: string; // "10분 | 4회"
};

type WorkoutRow = {
  id: string;
  label: string; // "빨리걷기"
  value: string; // "30분 이상" / "10분 | 2회"
};

type WorkoutSection = {
  id: string;
  title: string; // "유산소 운동" / "근력 운동"
  rows: WorkoutRow[];
};

function WorkoutRowBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.workoutRow}>
      <Text style={styles.workoutLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.workoutValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function HealthDetail() {
  const insets = useSafeAreaInsets();

  // ✅ 상단 추천 카드(백엔드로 교체 예정)
  const cards = useMemo<WorkoutCard[]>(
    () => [
      { id: "1", name: "레그컬", kcal: 130, info: "10분 | 4회" },
      { id: "2", name: "빨리걷기", kcal: 150, info: "30분 | 1회" },
    ],
    []
  );

  // ✅ 바텀시트(섹션/블럭)
  const sections = useMemo<WorkoutSection[]>(
    () => [
      {
        id: "aerobic",
        title: "유산소 운동",
        rows: [
          { id: "a1", label: "빨리걷기", value: "30분 이상" },
          { id: "a2", label: "조깅", value: "30분 이상" },
          { id: "a3", label: "수영", value: "20분 이상" },
        ],
      },
      {
        id: "strength",
        title: "근력 운동",
        rows: [
          { id: "s1", label: "스쿼트", value: "10분 | 2회" },
          { id: "s2", label: "런지", value: "15분 | 3회" },
          { id: "s3", label: "버드독", value: "10분 | 4회" },
        ],
      },
    ],
    []
  );

  // 선택된 카드(상단에서 눌렀을 때)
  const [selected, setSelected] = useState<WorkoutCard | null>(cards[0] ?? null);

  // ===== Bottom sheet drag =====
  const top = useSharedValue(SHEET_BOTTOM);
  const startTop = useSharedValue(SHEET_BOTTOM);

  // 시트가 완전히 열렸을 때만 내부 스크롤 ON
  const [sheetOpen, setSheetOpen] = useState(false);
  useAnimatedReaction(
    () => top.value,
    (v) => {
      const open = Math.abs(v - SHEET_TOP) < 10;
      runOnJS(setSheetOpen)(open);
    }
  );

  const pan = Gesture.Pan()
    .onBegin(() => {
      startTop.value = top.value;
    })
    .onUpdate((e) => {
      top.value = clamp(startTop.value + e.translationY, SHEET_TOP, SHEET_BOTTOM);
    })
    .onEnd((e) => {
      const mid = (SHEET_TOP + SHEET_BOTTOM) / 2;
      const shouldOpen = e.velocityY < -500 ? true : top.value < mid;

      top.value = withSpring(shouldOpen ? SHEET_TOP : SHEET_BOTTOM, {
        damping: 18,
        stiffness: 180,
      });
    });

  const sheetStyle = useAnimatedStyle(() => ({ top: top.value }));

  const openSheet = () => {
    top.value = withSpring(SHEET_TOP, { damping: 18, stiffness: 180 });
  };

  // ✅ 상단 전체 내려오는 정도(필요하면 숫자만 조절)
  const TOP_OFFSET = 40;

  return (
    <View style={[styles.safe, { paddingTop: insets.top + TOP_OFFSET }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.h1}>운동</Text>
        <Text style={styles.h2}>현재 혈당정보를 기반으로 맞춤 운동을 추천해드려요</Text>
      </View>

      {/* 추천 카드 리스트 */}
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setSelected(item);
              openSheet();
            }}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardKcal}>{item.kcal}kcal</Text>
            </View>
            <Text style={styles.cardInfo}>{item.info}</Text>
          </Pressable>
        )}
        ListFooterComponent={<View style={{ height: 140 }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Sheet */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <LinearGradient
            colors={["#61ADFF", "#AFD3FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sheetGradient}
          >
            <View style={styles.sheetHandle} />

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.sheetScrollContent}
              scrollEnabled={sheetOpen}
              showsVerticalScrollIndicator={false}
            >
              {/* (선택 카드가 있으면 상단에 살짝 표시해도 되고, 필요 없으면 아래 블록 삭제해도 됨) */}
              {selected && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.selectedHint}>
                    {selected.name} · {selected.kcal}kcal
                  </Text>
                </View>
              )}

              {sections.map((sec, idx) => (
                <View key={sec.id} style={styles.section}>
                  <Text style={styles.sectionTitle}>{sec.title}</Text>

                  <View style={styles.rowsWrap}>
                    {sec.rows.map((r) => (
                      <WorkoutRowBlock key={r.id} label={r.label} value={r.value} />
                    ))}
                  </View>

                  {idx !== sections.length - 1 && <View style={styles.divider} />}
                </View>
              ))}

              <View style={{ height: 80 }} />
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },

  header: { paddingHorizontal: 24 },
  h1: { fontSize: 23, fontWeight: "700", color: "#111111" },
  h2: { marginTop: 10, marginBottom: 28,fontSize: 15, color: "#666666" },

  listContent: {
    paddingTop: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12,
  },

  // ✅ 파란 테두리 없음
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: CARD_R,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 0,
  },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#111111" },
  cardKcal: { fontSize: 15, fontWeight: "600", color: "#111111" },
  cardInfo: { marginTop: 6, fontSize: 12, color: "#666666" },

  // ===== Bottom sheet =====
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: H,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  sheetGradient: { flex: 1, paddingTop: 10 },
  sheetHandle: {
    alignSelf: "center",
    width: 90,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.75)",
    marginBottom: 18,
  },
  sheetScrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },

  selectedHint: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },

  section: { paddingTop: 6, paddingBottom: 14 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 14,
  },

  rowsWrap: {
    gap: 12,
    alignItems: "center",
  },

  // ✅ 블럭 스펙 (Diet랑 동일)
  // bg #1D82EF / w333 h54 / radius20 / 글자 15
  workoutRow: {
    width: 333,
    height: 54,
    borderRadius: 20,
    backgroundColor: "#1D82EF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workoutLabel: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  workoutValue: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.45)",
    marginVertical: 18,
    marginHorizontal: 6,
  },
});
