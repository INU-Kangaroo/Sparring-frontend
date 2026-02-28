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

const { height: H } = Dimensions.get("window");

const SHEET_TOP = 100;
const SHEET_BOTTOM = H - 280;
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

type SupplementItem = {
  id: string;
  name: string;
  doseSummary: string;
  description: string;
  cautions: string[];
};

function CautionBox({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <View style={styles.cautionBox}>
      <Text style={styles.cautionTitle}>{title}</Text>
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

export default function SupplementDetail() {
  const insets = useSafeAreaInsets();

  const data = useMemo<SupplementItem[]>(
    () => [
      {
        id: "1",
        name: "마그네슘",
        doseSummary: "1정 | 2회",
        description:
          "인슐린 저항성을 줄여 혈당을 낮추는 데 도움을 주며,\n당뇨 환자는 부족해지기 쉬워 섭취가 필요할 수 있습니다.",
        cautions: [
          "결핍 증상: 식욕 감퇴, 피로, 근육 경련, 저린 감각, 불안, 두통, 수면 장애 등",
          "과다 섭취 시 증상: 설사, 근육 쇠약 등",
          "권장 섭취량: 성인 남성 350mg, 여성 280mg이며, 상한섭취량은 350mg입니다.",
        ],
      },
      {
        id: "2",
        name: "비타민 D",
        doseSummary: "1정 | 3회",
        description:
          "인슐린 저항성을 개선하여 혈당 수치를\n낮추는 데 도움을 줍니다.",
        cautions: [
          "지용성 비타민: 과다 섭취 시 체내에 축적될 수 있으므로 하루 2,000 IU 이상 섭취는 주의해야 합니다.",
          "유리창을 통해 들어오는 햇빛은 비타민 D 합성에 효과가 없습니다.",
          "개인의 체중이나 건강 상태에 따라 적절한 용량이 다를 수 있습니다.",
        ],
      },
      {
        id: "3",
        name: "오메가 3",
        doseSummary: "1정 | 3회",
        description:
          "혈중 중성지방 개선과 염증 조절에 도움을 줄 수 있어\n전반적인 대사 건강 관리에 보조적으로 활용될 수 있습니다.",
        cautions: [
          "항응고제 복용 중이거나 수술 예정인 경우 섭취 전 전문가와 상담하세요.",
          "위장 불편감이 있을 수 있어 식후 섭취를 권장합니다.",
          "어패류 알레르기가 있는 경우 주의가 필요합니다.",
        ],
      },
    ],
    []
  );

  const [selected, setSelected] = useState<SupplementItem>(data[0]);

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
  const selectItem = (item: SupplementItem) => {
    setSelected(item);
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 40 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push("/recommend/recommendation")}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>
        <Text style={styles.h1}>영양성분</Text>
        <Text style={styles.h2}>현재 건강상태에 맞는 영양성분을 추천해드려요</Text>
      </View>

      {/* 영양성분 버튼 리스트 */}
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
                    <Text style={styles.btnDoseActive}>{item.doseSummary}</Text>
                  </View>
                </LinearGradient>
              ) : (
                <View style={styles.btnInactive}>
                  <View style={styles.btnRow}>
                    <Text style={styles.btnName}>{item.name}</Text>
                    <Text style={styles.btnDose}>{item.doseSummary}</Text>
                  </View>
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
              {/* 영양성분 이름 */}
              <Text style={styles.sheetTitle}>{selected.name}</Text>
              <Text style={styles.sheetDose}>{selected.doseSummary}</Text>

              {/* 설명 */}
              <Text style={styles.sheetDesc}>{selected.description}</Text>

              <View style={styles.divider} />

              {/* 주의사항 */}
              <CautionBox title="주의사항" bullets={selected.cautions} />

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
    paddingVertical: 18,
    shadowColor: "#1D4BFF",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  btnNameActive: { fontSize: 15, fontWeight: "700", color: "#fff" },
  btnDoseActive: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.85)" },

  // 비활성 버튼
  btnInactive: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  btnName: { fontSize: 15, fontWeight: "600", color: "#111" },
  btnDose: { fontSize: 14, fontWeight: "500", color: "#888" },

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
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  sheetDose: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 18,
  },
  sheetDesc: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    paddingHorizontal: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginVertical: 20,
  },

  // 주의사항 박스
  cautionBox: {
    alignSelf: "center",
    width: "100%",
    borderRadius: 18,
    backgroundColor: "rgba(29, 130, 239, 0.55)",
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
});