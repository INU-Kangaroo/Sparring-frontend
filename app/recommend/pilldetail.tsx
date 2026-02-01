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

// 상단 카드(리스트) 스펙: 스샷처럼(흰 카드)
const CARD_W = 339;
const CARD_H = 67;
const CARD_R = 15;

// 바텀시트 위치
const SHEET_TOP = 120;
const SHEET_BOTTOM = H - 300;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

type SupplementItem = {
  id: string;
  name: string;

  // 바텀시트 리스트(요약 블럭) 우측 텍스트: "1정 | 2회" 같은 형태
  doseSummary: string;

  // 상세 설명(스샷 2처럼)
  description: string;

  // 주의사항(불릿 목록)
  cautions: string[];
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.summaryValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

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

  // ✅ 상단 추천 카드(백엔드로 교체 예정)
  const listData = useMemo<SupplementItem[]>(
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
          "권장 섭취량: 2020 한국인 영양소 섭취기준에 따르면 성인 남성 350mg, 여성 280mg이며, 상한섭취량은 350mg입니다.",
        ],
      },
      {
        id: "2",
        name: "비타민 D",
        doseSummary: "1정 | 3회",
        description: "인슐린 저항성을 개선하여 혈당 수치를\n낮추는 데 도움을 줍니다.",
        cautions: [
          "지용성 비타민: 과다 섭취 시 체내에 축적될 수 있으므로 하루 2,000 IU 이상 섭취는 주의해야 합니다.",
          "유리창: 유리창을 통해 들어오는 햇빛은 비타민 D 합성에 효과가 없습니다.",
          "개인차: 개인의 체중이나 건강 상태에 따라 적절한 용량이 다를 수 있습니다.",
        ],
      },
      {
        id: "3",
        name: "오메가 3",
        doseSummary: "1정 | 3회",
        description: "혈중 중성지방 개선과 염증 조절에 도움을 줄 수 있어\n전반적인 대사 건강 관리에 보조적으로 활용될 수 있습니다.",
        cautions: [
          "항응고제 복용 중이거나 수술 예정인 경우 섭취 전 전문가와 상담하세요.",
          "위장 불편감이 있을 수 있어 식후 섭취를 권장합니다.",
          "어패류 알레르기가 있는 경우 주의가 필요합니다.",
        ],
      },
    ],
    []
  );

  const [selected, setSelected] = useState<SupplementItem | null>(listData[0] ?? null);

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

  // 상단 전체 내려오는 정도
  const TOP_OFFSET = 40;

  return (
    <View style={[styles.safe, { paddingTop: insets.top + TOP_OFFSET }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.h1}>영양제</Text>
        <Text style={styles.h2}>현재 건강상태에 맞는 영양제를 추천해드려요</Text>
      </View>

      {/* List (상단 흰 카드) */}
      <FlatList
        data={listData}
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
            <Text style={styles.cardOnlyTitle} numberOfLines={1}>
              {item.name}
            </Text>
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
              {/* ✅ 1) 요약 리스트(스샷 1처럼: 영양제 타이틀 + 블럭 3개) */}
              <Text style={styles.sheetTopTitle}>영양제</Text>

              <View style={styles.summaryWrap}>
                {listData.map((it) => (
                  <Pressable
                    key={it.id}
                    onPress={() => setSelected(it)}
                    style={({ pressed }) => [pressed && { opacity: 0.95 }]}
                  >
                    <SummaryRow label={it.name} value={it.doseSummary} />
                  </Pressable>
                ))}
              </View>

              {/* ✅ 선택한 영양제 상세 (스샷 2 느낌) */}
              {selected && (
                <>
                  <View style={styles.divider} />

                  <Text style={styles.detailTitle}>{selected.name}</Text>
                  <Text style={styles.detailDesc}>{selected.description}</Text>

                  <CautionBox title="주의사항" bullets={selected.cautions} />
                </>
              )}

              {/* 아래에 다른 영양제들도 연속으로 상세를 다 보여주고 싶으면 아래 블록 켜기 */}
              {/* 
              <View style={styles.divider} />
              {listData
                .filter((x) => x.id !== selected?.id)
                .map((it) => (
                  <View key={it.id} style={{ marginTop: 18 }}>
                    <Text style={styles.detailTitle}>{it.name}</Text>
                    <Text style={styles.detailDesc}>{it.description}</Text>
                    <CautionBox title="주의사항" bullets={it.cautions} />
                    <View style={styles.divider} />
                  </View>
                ))}
              */}

              <View style={{ height: 90 }} />
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
  h2: {
    marginTop: 10,
    marginBottom: 28, // ✅ 첫 카드와 간격
    fontSize: 15,
    color: "#666666",
  },

  listContent: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12,
  },

  // 상단 카드(영양제는 스샷처럼 이름만)
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: CARD_R,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 0,
  },
  cardOnlyTitle: { fontSize: 15, fontWeight: "600", color: "#111111" },

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
  sheetScrollContent: { paddingHorizontal: 18, paddingBottom: 120 },

  sheetTopTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 14,
  },

  // ✅ 요약 블럭(식단/운동이랑 동일 스펙)
  summaryWrap: {
    gap: 12,
    alignItems: "center",
  },
  summaryRow: {
    width: 333,
    height: 54,
    borderRadius: 20,
    backgroundColor: "#1D82EF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  summaryValue: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.45)",
    marginVertical: 18,
    marginHorizontal: 6,
  },

  // ✅ 상세(스샷 2)
  detailTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 6,
  },
  detailDesc: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    paddingHorizontal: 10,
  },

  // ✅ 주의사항 박스(진한 파랑 + 둥근 사각형)
  cautionBox: {
    marginTop: 16,
    alignSelf: "center",
    width: 333,
    borderRadius: 18,
    backgroundColor: "rgba(29, 130, 239, 0.55)", // 진한 박스 느낌(2차에서 조절 가능)
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cautionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 18,
    color: "#FFFFFF",
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.92)",
  },
});
