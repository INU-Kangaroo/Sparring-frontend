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

// 카드 스펙
const CARD_W = 339;
const CARD_H = 67;
const CARD_R = 15;

// 바텀시트 위치
const SHEET_TOP = 120;
const SHEET_BOTTOM = H - 300;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

type DietItem = {
  id: string;
  name: string;
  kcal: number;
  servingText: string;
  carbs: string;
  protein: string;
  fat: string;
};

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
      },
      {
        id: "2",
        name: "소고기 전복죽",
        kcal: 450,
        servingText: "1인분 | 320g",
        carbs: "82.1g",
        protein: "32.5g",
        fat: "5.8g",
      },
      {
        id: "3",
        name: "닭가슴살 샌드위치",
        kcal: 390,
        servingText: "1인분 | 210g",
        carbs: "41.0g",
        protein: "33.2g",
        fat: "9.1g",
      },
      {
        id: "4",
        name: "연어 포케",
        kcal: 520,
        servingText: "1인분 | 350g",
        carbs: "58.4g",
        protein: "28.9g",
        fat: "18.3g",
      },
    ],
    []
  );

  const [selected, setSelected] = useState<DietItem | null>(data[0] ?? null);

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

  // ✅ 여기 값만 바꾸면 “전체가” 확 내려감
  const TOP_OFFSET = 40;

  return (
    <View style={[styles.safe, { paddingTop: insets.top + TOP_OFFSET }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.h1}>식단</Text>
        <Text style={styles.h2}>현재 건강상태에 맞는 음식을 추천해드려요</Text>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          return (
            <Pressable
              onPress={() => {
                setSelected(item);
                openSheet();
              }}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
            >
              <View style={styles.cardRow}>
                <Text style={styles.foodName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.kcal}>{item.kcal}kcal</Text>
              </View>
              <Text style={styles.serving}>{item.servingText}</Text>
            </Pressable>
          );
        }}
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
              {/* ✅ 선택된 메뉴 */}
              {selected && (
                <View style={styles.sheetSection}>
                  <View style={styles.sheetTitleBox}>
                    <Text style={styles.sheetTitle15}>{selected.name}</Text>
                    <Text style={styles.sheetTitle15}>{selected.kcal}kcal</Text>
                  </View>

                  <Text style={styles.sheetServing12}>{selected.servingText}</Text>

                  <View style={styles.nutrientsWrap}>
                    <NutrientRow label="탄수화물" value={selected.carbs} />
                    <NutrientRow label="단백질" value={selected.protein} />
                    <NutrientRow label="지방" value={selected.fat} />
                  </View>
                </View>
              )}

              <View style={styles.divider} />

              {/* ✅ 나머지 메뉴들(선택된 메뉴 제외) */}
              {data
                .filter((item) => item.id !== selected?.id)
                .map((item) => (
                  <View key={item.id} style={styles.sheetSection}>
                    <View style={styles.sheetTitleBox}>
                      <Text style={styles.sheetTitle15}>{item.name}</Text>
                      <Text style={styles.sheetTitle15}>{item.kcal}kcal</Text>
                    </View>

                    <Text style={styles.sheetServing12}>{item.servingText}</Text>

                    <View style={styles.nutrientsWrap}>
                      <NutrientRow label="탄수화물" value={item.carbs} />
                      <NutrientRow label="단백질" value={item.protein} />
                      <NutrientRow label="지방" value={item.fat} />
                    </View>

                    <View style={styles.divider} />
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
  h2: { marginTop: 10, marginBottom: 28, fontSize: 15, color: "#666666" },

  listContent: {
    paddingTop: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12,
  },

  // ✅ 파란 테두리 없게: border 자체 제거
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
  foodName: { fontSize: 15, fontWeight: "600", color: "#111111" },
  kcal: { fontSize: 15, fontWeight: "600", color: "#111111" },
  serving: { marginTop: 6, fontSize: 12, color: "#666666" },

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

  sheetSection: { paddingTop: 6, paddingBottom: 14 },
  sheetTitleBox: { alignItems: "center", gap: 4 },
  sheetTitle15: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", textAlign: "center" },
  sheetServing12: {
    marginTop: 10,
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },

  nutrientsWrap: { marginTop: 14, gap: 12, alignItems: "center" },

  nutrientRow: {
    width: 333,
    height: 54,
    borderRadius: 20,
    backgroundColor: "#1D82EF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // ✅ 15pt
  nutrientLabel: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  nutrientValue: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.45)",
    marginVertical: 18,
    marginHorizontal: 6,
  },
});
