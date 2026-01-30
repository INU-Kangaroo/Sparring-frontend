import React, { useMemo, useRef, useState, useEffect } from "react";
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

const { width } = Dimensions.get("window");

const ACTIVE_GRADIENT = ["#0D99FF", "#1D4BFF"] as const;
const INACTIVE_BG = "#EDEDED";

type CardKey = "diet" | "workout" | "supp";
type CardItem = { key: CardKey; title: string };

const mod = (n: number, m: number) => ((n % m) + m) % m;

export default function RecommendationScreen() {
  // 식단 -> 운동 -> 영양제
  const base = useMemo<CardItem[]>(
    () => [
      { key: "diet", title: "식단" },
      { key: "workout", title: "운동" },
      { key: "supp", title: "영양제" },
    ],
    []
  );

  // 카드 크기 / 간격
  const CARD_WIDTH = 209;
  const CARD_HEIGHT = 309;
  const GAP = 18;
  const ITEM_WIDTH = CARD_WIDTH + GAP;
  const SIDE_PADDING = (width - CARD_WIDTH) / 2;

  // 무한루프용 데이터
  const LOOP = 60;
  const data = useMemo(() => {
    const arr: CardItem[] = [];
    for (let i = 0; i < LOOP; i++) arr.push(...base);
    return arr;
  }, [base]);

  // 가운데 블록에서 시작
  const START_BLOCK = Math.floor(LOOP / 2);
  const START_INDEX = START_BLOCK * base.length + 0; // 0: 식단

  const [activeKey, setActiveKey] = useState<CardKey>("diet");
  const listRef = useRef<FlatList<CardItem>>(null);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToIndex({ index: START_INDEX, animated: false });
    }, 0);
  }, []);

  // 필터 이동
  const goFilter = () => {
    if (activeKey === "diet") router.push("/recommend/foodfilter");
    else if (activeKey === "workout") router.push("/recommend/healthfilter");
    else router.push("/recommend/pillfilter");
  };

  // 상세 이동
  const goDetailByKey = (key: CardKey) => {
    if (key === "diet") router.push("/recommend/fooddetail");
    else if (key === "workout") router.push("/recommend/healthdetail");
    else router.push("/recommend/pilldetail");
  };

  const goHome = () => router.push("/");

  // 스크롤 끝났을 때 활성 카드 계산
  const handleEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;

    // padding 포함해서 가운데 카드 인덱스 계산
    const rawIndex = Math.round((x + SIDE_PADDING) / ITEM_WIDTH);
    const idx = mod(rawIndex, data.length);

    const baseIdx = mod(idx, base.length);
    const nextKey = base[baseIdx].key;
    setActiveKey(nextKey);

    // 양 끝에 가까워지면 가운데 블록으로 텔레포트
    const LEFT_LIMIT = base.length * 2;
    const RIGHT_LIMIT = data.length - base.length * 2;

    if (idx < LEFT_LIMIT || idx > RIGHT_LIMIT) {
      const newIndex = START_BLOCK * base.length + baseIdx;
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ index: newIndex, animated: false });
      });
    }
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
          onMomentumScrollEnd={handleEnd}
          renderItem={({ item }) => {
            const isActive = item.key === activeKey;

            return (
              <View style={{ width: CARD_WIDTH, marginRight: GAP }}>
                <Pressable
                  disabled={!isActive} // 가운데 카드만 클릭
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

        <Pressable onPress={goFilter} style={styles.filterBtn}>
          <Text style={styles.filterText}>필터 선택하기</Text>
          <View style={styles.filterUnderline} />
        </Pressable>
      </View>

      {/* 하단 홈 버튼 */}
      <View style={styles.homeBar}>
        <Pressable
          onPress={goHome}
          style={({ pressed }) => [pressed && { opacity: 0.9 }]}
        >
          <LinearGradient
            colors={["#6FA8FF", "#5A80FF"]}
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
    backgroundColor: "white",
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
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardInactive: {
    backgroundColor: INACTIVE_BG,
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },

  cardTitleActive: { color: "white", fontSize: 18, fontWeight: "800" },
  cardTitleInactive: { color: "#B7B7B7", fontSize: 18, fontWeight: "800" },

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
    borderColor: "white",
    opacity: 0.85,
  },
  dotActive: { backgroundColor: "white", opacity: 1 },

  filterBtn: { alignItems: "center", marginTop: 14 },
  filterText: { color: "#b7b7b7", fontWeight: "700" },
  filterUnderline: {
    width: 86,
    height: 2,
    backgroundColor: "#d9d9d9",
    marginTop: 6,
    borderRadius: 999,
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
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
