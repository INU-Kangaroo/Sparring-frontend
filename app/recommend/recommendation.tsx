import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

const { width } = Dimensions.get("window");

const ACTIVE_GRADIENT = [Colors.light.primary, Colors.light.primaryStrong] as const;
const INACTIVE_BG = Colors.light.mutedBackground;

type CardKey = "diet" | "workout" | "supp";
type CardItem = { key: CardKey; title: string };

const mod = (n: number, m: number) => ((n % m) + m) % m;

export default function RecommendationScreen() {
  const base = useMemo<CardItem[]>(
    () => [
      { key: "diet", title: "식단" },
      { key: "workout", title: "운동" },
      { key: "supp", title: "영양제" },
    ],
    []
  );

  const CARD_WIDTH = 209;
  const CARD_HEIGHT = 309;
  const GAP = 18;
  const ITEM_WIDTH = CARD_WIDTH + GAP;
  const SIDE_PADDING = (width - CARD_WIDTH) / 2;

  const LOOP = 60;
  const data = useMemo(() => {
    const arr: CardItem[] = [];
    for (let i = 0; i < LOOP; i++) arr.push(...base);
    return arr;
  }, [base]);

  const START_BLOCK = Math.floor(LOOP / 2);
  const START_INDEX = START_BLOCK * base.length + 0;

  const [activeIndex, setActiveIndex] = useState<number>(START_INDEX);
  const activeKey: CardKey = base[mod(activeIndex, base.length)].key;

  const listRef = useRef<FlatList<CardItem>>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: START_INDEX, animated: false });
    });
  }, []);

  const goFilter = () => {
    if (activeKey === "diet") router.push("/recommend/foodfilter");
    else if (activeKey === "workout") router.push("/recommend/healthfilter");
    else router.push("/recommend/pilldetail");
  };

  const goDetailByKey = (key: CardKey) => {
    if (key === "diet") router.push("/recommend/foodfilter");
    else if (key === "workout") router.push("/recommend/healthdetail");
    else router.push("/recommend/pilldetail");
  };

  const goHome = () => router.push("/main/main");

  const syncActiveFromOffset = useCallback(
    (x: number) => {
      const rawIndex = Math.round(x / ITEM_WIDTH);
      setActiveIndex(rawIndex);

      const LEFT_LIMIT = base.length * 2;
      const RIGHT_LIMIT = data.length - base.length * 2;

      if (rawIndex < LEFT_LIMIT || rawIndex > RIGHT_LIMIT) {
        const baseIdx = mod(rawIndex, base.length);
        const newIndex = START_BLOCK * base.length + baseIdx;
        requestAnimationFrame(() => {
          listRef.current?.scrollToIndex({ index: newIndex, animated: false });
        });
        setActiveIndex(newIndex);
      }
    },
    [ITEM_WIDTH, base.length, data.length, START_BLOCK, base]
  );

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const rawIndex = Math.round(x / ITEM_WIDTH);
    setActiveIndex(rawIndex);
  };

  const handleEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    syncActiveFromOffset(x);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>추천 페이지</Text>
      <Text style={styles.h2}>추천 페이지</Text>

      <View style={{ marginTop: 40 }}>
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={(_, i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={ITEM_WIDTH}
          snapToAlignment="start"
          bounces={false}
          contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleEnd}
          onScrollEndDrag={handleEnd}
          renderItem={({ item, index }) => {
            const isActive = index === activeIndex;
            return (
              <View style={{ width: CARD_WIDTH, marginRight: GAP }}>
                <Pressable
                  disabled={!isActive}
                  onPress={() => goDetailByKey(item.key)}
                  style={{ borderRadius: 22 }}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={ACTIVE_GRADIENT}
                      start={{ x: 0.15, y: 0.2 }}
                      end={{ x: 0.85, y: 0.8 }}
                      style={[
                        styles.cardBase,
                        { width: CARD_WIDTH, height: CARD_HEIGHT },
                      ]}
                    >
                      <Text style={styles.cardTitleActive}>{item.title}</Text>
                      <View style={styles.dots}>
                        {base.map((b) => {
                          const active = b.key === activeKey;
                          return (
                            <View
                              key={b.key}
                              style={[styles.dot, active && styles.dotActive]}
                            />
                          );
                        })}
                      </View>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.cardBase,
                        styles.cardInactive,
                        { width: CARD_WIDTH, height: CARD_HEIGHT },
                      ]}
                    >
                      <Text style={styles.cardTitleInactive}>{item.title}</Text>
                      <View style={styles.dotsPlaceholder} />
                    </View>
                  )}
                </Pressable>
              </View>
            );
          }}
        />

        {/* ✅ 영양성분일 때도 자리 유지 - opacity로만 숨김 */}
        <Pressable
          onPress={activeKey !== "supp" ? goFilter : undefined}
          style={[styles.filterBtn, activeKey === "supp" && { opacity: 0 }]}
          pointerEvents={activeKey === "supp" ? "none" : "auto"}
        >
          <Text style={styles.filterText}>필터 선택하기</Text>
          <View style={styles.filterUnderline} />
        </Pressable>
      </View>

      {/* 오늘의 기록 입력 섹션 */}
      <View style={styles.logSection}>
        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>오늘의 기록</Text>
          <Text style={styles.logSubtitle}>
            식사 기록과 운동 상태를 확인하고 맞춤 추천을 받아보세요
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/recommend/input")}
          style={({ pressed }) => [styles.logBtn, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.logBtnLeft}>
            <View style={styles.logIconBox}>
              <Ionicons name="pencil" size={18} color={Colors.light.primaryStrong} />
            </View>
            <View>
              <Text style={styles.logBtnTitle}>오늘 식사 기록 입력</Text>
              <Text style={styles.logBtnSub}>식후 반응과 운동 흐름을 함께 살펴봐요</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.light.stone} />
        </Pressable>
      </View>

      {/* 하단 홈 버튼 */}
      <View style={styles.homeBar}>
        <Pressable
          onPress={goHome}
          style={({ pressed }) => [pressed && { opacity: 0.9 }]}
        >
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.primaryStrong]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.homeBtn}
          >
            <Ionicons name="home" size={20} color="white" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 110,
  },
  h1: { fontSize: 26, fontWeight: "800", marginTop: 8 },
  h2: { fontSize: 16, fontWeight: "600", marginTop: 10 },

  cardBase: {
    borderRadius: 22,
    padding: 18,
    justifyContent: "space-between",
    shadowColor: Colors.light.ink,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardInactive: {
    backgroundColor: INACTIVE_BG,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardTitleActive: { color: Colors.light.card, fontSize: 18, fontWeight: "800" },
  cardTitleInactive: { color: Colors.light.stone, fontSize: 18, fontWeight: "800" },

  dots: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingBottom: 8,
  },
  dotsPlaceholder: { height: 15 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.light.card,
    opacity: 0.85,
  },
  dotActive: { backgroundColor: Colors.light.card, opacity: 1 },

  filterBtn: { alignItems: "center", marginTop: 14 },
  filterText: { color: Colors.light.stone, fontWeight: "700" },
  filterUnderline: {
    width: 86,
    height: 2,
    backgroundColor: Colors.light.border,
    marginTop: 6,
    borderRadius: 999,
  },

  // 오늘의 기록 섹션
  logSection: {
    marginTop: 32,
    paddingHorizontal: 4,
  },
  logHeader: {
    marginBottom: 14,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.text,
  },
  logSubtitle: {
    fontSize: 13,
    color: Colors.light.subtleText,
    marginTop: 4,
    fontWeight: "500",
  },
  logBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.primarySurface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.light.primarySurfaceStrong,
  },
  logBtnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  logIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.primarySurfaceStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  logBtnTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
  },
  logBtnSub: {
    fontSize: 12,
    color: Colors.light.subtleText,
    marginTop: 2,
    fontWeight: "500",
  },

  homeBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  homeBtn: {
    width: 120,
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.ink,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
