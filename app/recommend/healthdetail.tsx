import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
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
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  Polyline,
  Line,
  Text as SvgText,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Path,
} from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");

const SHEET_TOP = 100;
const SHEET_BOTTOM = H - 280;
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

type WorkoutItem = {
  id: string;
  name: string;
  kcal: number;
  info: string;
  calorieData: { t: number; v: number }[];
  sections: {
    id: string;
    title: string;
    rows: { id: string; label: string; value: string }[];
  }[];
};

// 그래프 컴포넌트
function CalorieGraph({ data }: { data: { t: number; v: number }[] }) {
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
  const minV = 0;
  const maxV = Math.max(...data.map((d) => d.v)) + 10;

  const toX = (t: number) =>
    PAD_L + ((t - minT) / (maxT - minT)) * innerW;
  const toY = (v: number) =>
    PAD_T + innerH - ((v - minV) / (maxV - minV)) * innerH;

  const points = data.map((d) => `${toX(d.t)},${toY(d.v)}`).join(" ");

  const areaPath =
    `M ${toX(data[0].t)},${toY(data[0].v)} ` +
    data.slice(1).map((d) => `L ${toX(d.t)},${toY(d.v)}`).join(" ") +
    ` L ${toX(data[data.length - 1].t)},${PAD_T + innerH} L ${toX(data[0].t)},${PAD_T + innerH} Z`;

  const yTicks = [
    Math.round(maxV * 0.25),
    Math.round(maxV * 0.5),
    Math.round(maxV * 0.75),
  ];
  const xLabels = data.filter((_, i) => i % 2 === 0);

  return (
    <Svg width={GRAPH_W} height={GRAPH_H}>
      <Defs>
        <SvgGradient id="calorieGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </SvgGradient>
      </Defs>

      <Path d={areaPath} fill="url(#calorieGrad)" />

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

      <Line
        x1={PAD_L}
        y1={PAD_T + innerH}
        x2={PAD_L + innerW}
        y2={PAD_T + innerH}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1}
      />

      {xLabels.map((d) => (
        <SvgText
          key={d.t}
          x={toX(d.t)}
          y={PAD_T + innerH + 14}
          fontSize={9}
          fill="rgba(255,255,255,0.8)"
          textAnchor="middle"
        >
          {d.t}분
        </SvgText>
      ))}

      <Polyline
        points={points}
        fill="none"
        stroke="white"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

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

function WorkoutRowBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.workoutRow}>
      <Text style={styles.workoutLabel}>{label}</Text>
      <Text style={styles.workoutValue}>{value}</Text>
    </View>
  );
}

export default function HealthDetail() {
  const insets = useSafeAreaInsets();

  const data = useMemo<WorkoutItem[]>(
    () => [
      {
        id: "1",
        name: "레그컬",
        kcal: 130,
        info: "10분 | 4회",
        calorieData: [
          { t: 0, v: 140 },
          { t: 5, v: 132 },
          { t: 10, v: 122 },
          { t: 15, v: 112 },
          { t: 20, v: 105 },
          { t: 25, v: 98 },
          { t: 30, v: 92 },
        ],
        sections: [
          {
            id: "s1",
            title: "근력 운동",
            rows: [
              { id: "r1", label: "레그컬", value: "10분 | 4회" },
              { id: "r2", label: "스쿼트", value: "10분 | 2회" },
              { id: "r3", label: "런지", value: "15분 | 3회" },
            ],
          },
        ],
      },
      {
        id: "2",
        name: "빨리걷기",
        kcal: 150,
        info: "30분 | 1회",
        calorieData: [
          { t: 0, v: 140 },
          { t: 5, v: 130 },
          { t: 10, v: 118 },
          { t: 15, v: 105 },
          { t: 20, v: 95 },
          { t: 25, v: 88 },
          { t: 30, v: 82 },
        ],
        sections: [
          {
            id: "s1",
            title: "유산소 운동",
            rows: [
              { id: "r1", label: "빨리걷기", value: "30분 이상" },
              { id: "r2", label: "조깅", value: "30분 이상" },
              { id: "r3", label: "수영", value: "20분 이상" },
            ],
          },
        ],
      },
    ],
    []
  );

  const [selected, setSelected] = useState<WorkoutItem>(data[0]);

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

  // 버튼 눌러도 시트 위치 변경 없음 - 데이터만 교체
  const selectItem = (item: WorkoutItem) => {
    setSelected(item);
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 40 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/recommend/recommendation")} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>
        <Text style={styles.h1}>운동</Text>
        <Text style={styles.h2}>현재 혈당정보를 기반으로 맞춤 운동을 추천해드려요</Text>
      </View>

      {/* 운동 버튼 리스트 */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {data.map((item) => {
          const isActive = selected.id === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => selectItem(item)}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              {isActive ? (
                <LinearGradient
                  colors={["#0D99FF", "#1D4BFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnActive}
                >
                  <View style={styles.btnRow}>
                    <Text style={styles.btnNameActive}>{item.name}</Text>
                    <Text style={styles.btnKcalActive}>{item.kcal}kcal</Text>
                  </View>
                  <Text style={styles.btnInfoActive}>{item.info}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.btnInactive}>
                  <View style={styles.btnRow}>
                    <Text style={styles.btnName}>{item.name}</Text>
                    <Text style={styles.btnKcal}>{item.kcal}kcal</Text>
                  </View>
                  <Text style={styles.btnInfo}>{item.info}</Text>
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
              {/* 운동 이름 + kcal */}
              <Text style={styles.sheetTitle}>{selected.name}</Text>
              <Text style={styles.sheetKcal}>{selected.kcal}kcal</Text>
              <Text style={styles.sheetInfo}>{selected.info}</Text>

              {/* 칼로리 소모 그래프 */}
              <View style={styles.graphSection}>
                <Text style={styles.graphLabel}>혈당 변화 예측</Text>
                <View style={styles.graphBox}>
                  <CalorieGraph data={selected.calorieData} />
                </View>
                <Text style={styles.graphCaption}>
                  * 운동 시 혈당 변화 추이 (개인차가 있을 수 있어요)
                </Text>
              </View>

              <View style={styles.divider} />

              {/* 운동 섹션 */}
              {selected.sections.map((sec, idx) => (
                <View key={sec.id} style={styles.section}>
                  <Text style={styles.sectionTitle}>{sec.title}</Text>
                  <View style={styles.rowsWrap}>
                    {sec.rows.map((r) => (
                      <WorkoutRowBlock key={r.id} label={r.label} value={r.value} />
                    ))}
                  </View>
                  {idx !== selected.sections.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}

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
  btnActive: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: "#1D4BFF",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  btnNameActive: { fontSize: 15, fontWeight: "700", color: "#fff" },
  btnKcalActive: { fontSize: 15, fontWeight: "700", color: "#fff" },
  btnInfoActive: { marginTop: 5, fontSize: 12, color: "rgba(255,255,255,0.8)" },

  // 비활성 버튼
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
  btnName: { fontSize: 15, fontWeight: "600", color: "#111" },
  btnKcal: { fontSize: 15, fontWeight: "600", color: "#111" },
  btnInfo: { marginTop: 5, fontSize: 12, color: "#666" },

  btnRow: {
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
  sheetInfo: {
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

  section: { paddingTop: 6, paddingBottom: 14 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 14,
  },
  rowsWrap: { gap: 10 },

  workoutRow: {
    borderRadius: 20,
    backgroundColor: "#1D82EF",
    paddingHorizontal: 18,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  workoutLabel: { fontSize: 15, fontWeight: "700", color: "#fff" },
  workoutValue: { fontSize: 15, fontWeight: "800", color: "#fff" },
});