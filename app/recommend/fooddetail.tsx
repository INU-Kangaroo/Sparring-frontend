import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Polyline, Line, Text as SvgText, Circle, Defs, LinearGradient as SvgGradient, Stop, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

const { width: W, height: H } = Dimensions.get("window");

const SHEET_TOP = 100;
const SHEET_BOTTOM = H - 280;
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

type DietItem = {
  id: string;
  name: string;
  kcal: number;
  servingText: string;
  carbs: string;
  protein: string;
  fat: string;
  // 혈당 데이터: [시간(분 후), 혈당값] 배열
  glucoseData: { t: number; v: number }[];
};

// 그래프 컴포넌트
function GlucoseGraph({ data }: { data: { t: number; v: number }[] }) {
  const GRAPH_W = W - 80;
  const GRAPH_H = 140;
  const PAD_L = 36;
  const PAD_R = 16;
  const PAD_T = 12;
  const PAD_B = 28;

  const innerW = GRAPH_W - PAD_L - PAD_R;
  const innerH = GRAPH_H - PAD_T - PAD_B;

  const minT = Math.min(...data.map((d) => d.t));
  const maxT = Math.max(...data.map((d) => d.t));
  const minV = Math.min(...data.map((d) => d.v)) - 10;
  const maxV = Math.max(...data.map((d) => d.v)) + 10;

  const toX = (t: number) => PAD_L + ((t - minT) / (maxT - minT)) * innerW;
  const toY = (v: number) => PAD_T + innerH - ((v - minV) / (maxV - minV)) * innerH;

  const points = data.map((d) => `${toX(d.t)},${toY(d.v)}`).join(" ");

  // 면적용 path
  const areaPath =
    `M ${toX(data[0].t)},${toY(data[0].v)} ` +
    data.slice(1).map((d) => `L ${toX(d.t)},${toY(d.v)}`).join(" ") +
    ` L ${toX(data[data.length - 1].t)},${PAD_T + innerH} L ${toX(data[0].t)},${PAD_T + innerH} Z`;

  // y축 눈금
  const yTicks = [minV + 10, Math.round((minV + maxV) / 2), maxV - 10];
  // x축 레이블
  const xLabels = data.filter((_, i) => i % 2 === 0);

  return (
    <Svg width={GRAPH_W} height={GRAPH_H}>
      <Defs>
        <SvgGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </SvgGradient>
      </Defs>

      {/* 면적 */}
      <Path d={areaPath} fill="url(#areaGrad)" />

      {/* y축 그리드 */}
      {yTicks.map((v) => (
        <React.Fragment key={v}>
          <Line
            x1={PAD_L}
            y1={toY(v)}
            x2={PAD_L + innerW}
            y2={toY(v)}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <SvgText
            x={PAD_L - 4}
            y={toY(v) + 4}
            fontSize={9}
            fill="rgba(255,255,255,0.8)"
            textAnchor="end"
          >
            {v}
          </SvgText>
        </React.Fragment>
      ))}

      {/* x축 */}
      <Line
        x1={PAD_L}
        y1={PAD_T + innerH}
        x2={PAD_L + innerW}
        y2={PAD_T + innerH}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1}
      />

      {/* x축 레이블 */}
      {xLabels.map((d) => (
        <SvgText
          key={d.t}
          x={toX(d.t)}
          y={PAD_T + innerH + 14}
          fontSize={9}
          fill="rgba(255,255,255,0.8)"
          textAnchor="middle"
        >
          +{d.t}분
        </SvgText>
      ))}

      {/* 선 */}
      <Polyline
        points={points}
        fill="none"
        stroke="white"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 포인트 */}
      {data.map((d, i) => (
        <Circle
          key={i}
          cx={toX(d.t)}
          cy={toY(d.v)}
          r={3.5}
          fill="white"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.5}
        />
      ))}
    </Svg>
  );
}

function NutrientRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.nutrientRow}>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <Text style={styles.nutrientValue}>{value}</Text>
    </View>
  );
}

export default function DietRecommendScreen() {
  const insets = useSafeAreaInsets();

  const data = useMemo<DietItem[]>(
    () => [
      {
        id: "1",
        name: "바질 페스토 샐러드",
        kcal: 325,
        servingText: "1인분 | 240g",
        carbs: "52.7g",
        protein: "11.8g",
        fat: "3.2g",
        glucoseData: [
          { t: 0, v: 90 },
          { t: 15, v: 105 },
          { t: 30, v: 130 },
          { t: 45, v: 148 },
          { t: 60, v: 140 },
          { t: 90, v: 118 },
          { t: 120, v: 95 },
        ],
      },
      {
        id: "2",
        name: "소고기 전복죽",
        kcal: 450,
        servingText: "1인분 | 320g",
        carbs: "82.1g",
        protein: "32.5g",
        fat: "5.8g",
        glucoseData: [
          { t: 0, v: 90 },
          { t: 15, v: 115 },
          { t: 30, v: 155 },
          { t: 45, v: 178 },
          { t: 60, v: 165 },
          { t: 90, v: 130 },
          { t: 120, v: 98 },
        ],
      },
      {
        id: "3",
        name: "닭가슴살 샌드위치",
        kcal: 390,
        servingText: "1인분 | 210g",
        carbs: "41.0g",
        protein: "33.2g",
        fat: "9.1g",
        glucoseData: [
          { t: 0, v: 90 },
          { t: 15, v: 100 },
          { t: 30, v: 120 },
          { t: 45, v: 135 },
          { t: 60, v: 128 },
          { t: 90, v: 110 },
          { t: 120, v: 93 },
        ],
      },
      {
        id: "4",
        name: "연어 포케",
        kcal: 520,
        servingText: "1인분 | 350g",
        carbs: "58.4g",
        protein: "28.9g",
        fat: "18.3g",
        glucoseData: [
          { t: 0, v: 90 },
          { t: 15, v: 108 },
          { t: 30, v: 138 },
          { t: 45, v: 160 },
          { t: 60, v: 152 },
          { t: 90, v: 122 },
          { t: 120, v: 96 },
        ],
      },
    ],
    []
  );

  const [selected, setSelected] = useState<DietItem>(data[0]);

  // ── Bottom Sheet ──────────────────────────────────────────
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
    .onBegin(() => { startTop.value = top.value; })
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

  const openSheet = (item: DietItem) => {
    setSelected(item);
    top.value = withSpring(SHEET_TOP, { damping: 18, stiffness: 180 });
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 40 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/recommend/recommendation")} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>
        <Text style={styles.h1}>식단</Text>
        <Text style={styles.h2}>현재 건강상태에 맞는 음식을 추천해드려요</Text>
      </View>

      {/* 음식 버튼 리스트 */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {data.map((item) => {
          const isActive = selected.id === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => openSheet(item)}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              {isActive ? (
                <LinearGradient
                  colors={["#0D99FF", "#1D4BFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.foodBtnActive}
                >
                  <View style={styles.foodBtnRow}>
                    <Text style={styles.foodBtnNameActive}>{item.name}</Text>
                    <Text style={styles.foodBtnKcalActive}>{item.kcal}kcal</Text>
                  </View>
                  <Text style={styles.foodBtnServingActive}>{item.servingText}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.foodBtnInactive}>
                  <View style={styles.foodBtnRow}>
                    <Text style={styles.foodBtnName}>{item.name}</Text>
                    <Text style={styles.foodBtnKcal}>{item.kcal}kcal</Text>
                  </View>
                  <Text style={styles.foodBtnServing}>{item.servingText}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* 바텀 시트 */}
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
              {/* 음식 이름 + kcal */}
              <Text style={styles.sheetTitle}>{selected.name}</Text>
              <Text style={styles.sheetKcal}>{selected.kcal}kcal</Text>
              <Text style={styles.sheetServing}>{selected.servingText}</Text>

              {/* 혈당 그래프 */}
              <View style={styles.graphSection}>
                <Text style={styles.graphLabel}>혈당 변화 예측</Text>
                <View style={styles.graphBox}>
                  <GlucoseGraph data={selected.glucoseData} />
                </View>
                <Text style={styles.graphCaption}>* 식후 혈당 변화 추이 (개인차가 있을 수 있어요)</Text>
              </View>

              <View style={styles.divider} />

              {/* 영양성분 */}
              <Text style={styles.sectionLabel}>영양성분</Text>
              <View style={styles.nutrientsWrap}>
                <NutrientRow label="탄수화물" value={selected.carbs} />
                <NutrientRow label="단백질" value={selected.protein} />
                <NutrientRow label="지방" value={selected.fat} />
              </View>

              <View style={{ height: 100 }} />
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  h1: { fontSize: 23, fontWeight: "700", color: "#111111" },
  h2: { marginTop: 10, marginBottom: 20, fontSize: 15, color: "#666666" },

  listContent: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 4,
  },

  // 활성 버튼
  foodBtnActive: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: "#1D4BFF",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  foodBtnNameActive: { fontSize: 15, fontWeight: "700", color: "#fff" },
  foodBtnKcalActive: { fontSize: 15, fontWeight: "700", color: "#fff" },
  foodBtnServingActive: { marginTop: 5, fontSize: 12, color: "rgba(255,255,255,0.8)" },

  // 비활성 버튼
  foodBtnInactive: {
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
  foodBtnName: { fontSize: 15, fontWeight: "600", color: "#111" },
  foodBtnKcal: { fontSize: 15, fontWeight: "600", color: "#111" },
  foodBtnServing: { marginTop: 5, fontSize: 12, color: "#666" },

  foodBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // 바텀시트
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
    marginBottom: 16,
  },
  sheetScrollContent: { paddingHorizontal: 20, paddingBottom: 120 },

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
  sheetServing: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginBottom: 18,
  },

  // 그래프
  graphSection: {
    alignItems: "center",
    marginBottom: 6,
  },
  graphLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    alignSelf: "flex-start",
    marginBottom: 10,
    opacity: 0.9,
  },
  graphBox: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "100%",
    alignItems: "center",
  },
  graphCaption: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8,
    alignSelf: "flex-start",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginVertical: 18,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    opacity: 0.9,
  },

  nutrientsWrap: { gap: 10 },
  nutrientRow: {
    borderRadius: 20,
    backgroundColor: "#1D82EF",
    paddingHorizontal: 18,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nutrientLabel: { fontSize: 15, fontWeight: "700", color: "#fff" },
  nutrientValue: { fontSize: 15, fontWeight: "800", color: "#fff" },
});