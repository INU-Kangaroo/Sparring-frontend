import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
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
  fetchSupplementRecommendation,
  refreshSupplementRecommendation,
  Supplement,
} from "../api/recommendation";

import Colors from "@/constants/Colors";
import RecommendationHeader from "./components/RecommendationHeader";
import RecommendationCard from "./components/RecommendationCard";
import RecommendationBottomSheet from "./components/RecommendationBottomSheet";

const MAX_OPEN_TOP = 110;

type SupplementItem = {
  id: string;
  name: string;
  doseSummary: string;
  description: string;
  cautions: string[];
};

function mapSupplement(
  s: Supplement,
  idx: number
): SupplementItem {
  return {
    id: String(idx),
    name: s.name,
    doseSummary: `${s.dosage} | ${s.frequency}`,
    description: s.benefit,
    cautions: s.precautions,
  };
}

function getApiErrorMessage(error: unknown) {
  const status = (error as any)?.response?.status;
  const responseData =
    (error as any)?.response?.data;
  const message = (error as any)?.message;

  if (status) {
    return `영양제 추천 호출 실패 (${status})\n${JSON.stringify(
      responseData ?? {}
    )}`;
  }

  return `영양제 추천 호출 실패\n${String(
    message ?? error
  )}`;
}

function CautionBox({
  title,
  bullets,
}: {
  title: string;
  bullets: string[];
}) {
  return (
    <View style={styles.cautionBox}>
      <Text style={styles.cautionTitle}>
        {title}
      </Text>

      <View style={{ marginTop: 10, gap: 8 }}>
        {bullets.map((b, idx) => (
          <View
            key={idx}
            style={styles.bulletRow}
          >
            <Text style={styles.bulletDot}>
              •
            </Text>

            <Text style={styles.bulletText}>
              {b}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SupplementDetail() {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<
    SupplementItem[]
  >([]);

  const [selected, setSelected] =
    useState<SupplementItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadError, setLoadError] =
    useState(false);

  useEffect(() => {
    fetchSupplementRecommendation()
      .then((res) => {
        const mapped =
          res.supplements.map(mapSupplement);

        setData(mapped);

        if (mapped.length > 0) {
          setSelected(mapped[0]);
        }

        setLoadError(false);
      })
      .catch((error) => {
        console.error(error);

        alert(getApiErrorMessage(error));

        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      const res =
        await refreshSupplementRecommendation();

      const mapped =
        res.supplements.map(mapSupplement);

      setData(mapped);

      if (mapped.length > 0) {
        setSelected(mapped[0]);
      }

      setLoadError(false);
    } catch {
      alert(
        "영양제 추천 새로고침에 실패했어요."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Bottom Sheet
  const SHEET_BOTTOM = Math.max(160, screenHeight - 170);
  const OPEN_THRESHOLD = 8;
  const openTop = MAX_OPEN_TOP;

  const top = useSharedValue(SHEET_BOTTOM);

  const startTop =
    useSharedValue(SHEET_BOTTOM);

  const [sheetOpen, setSheetOpen] =
    useState(false);

  useEffect(() => {
    top.value = SHEET_BOTTOM;
  }, [SHEET_BOTTOM, top]);

  useAnimatedReaction(
    () => top.value,
    (v) => {
      runOnJS(setSheetOpen)(
        Math.abs(v - openTop) <= OPEN_THRESHOLD
      );
    }
  );

  const pan = Gesture.Pan()
    .onBegin(() => {
      startTop.value = top.value;
    })
    .onUpdate((e) => {
      const nextTop =
        startTop.value + e.translationY;

      top.value = Math.min(
        Math.max(nextTop, openTop),
        SHEET_BOTTOM
      );
    })
    .onEnd((e) => {
      const mid =
        (openTop + SHEET_BOTTOM) / 2;

      const shouldOpen =
        e.velocityY < -500
          ? true
          : top.value < mid;

      top.value = withSpring(
        shouldOpen
          ? openTop
          : SHEET_BOTTOM,
        {
          damping: 18,
          stiffness: 180,
        }
      );
    });

  const sheetStyle = useAnimatedStyle(() => ({
    top: top.value,
  }));

  const openSheet = (item: SupplementItem) => {
    setSelected(item);
    top.value = withSpring(
      openTop,
      {
        damping: 18,
        stiffness: 180,
      }
    );
  };

  if (loading) {
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
        <ActivityIndicator
          size="large"
          color={Colors.light.primaryStrong}
        />

        <Text style={styles.loadingText}>
          영양제 추천을 불러오는 중...
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View
        style={[
          styles.safe,
          styles.centerState,
        ]}
      >
        <Ionicons
          name="medkit-outline"
          size={48}
          color={"#ccc"}
        />

        <Text style={styles.stateText}>
          영양제 추천을 불러오지 못했어요
        </Text>

        <Pressable
          onPress={() =>
            router.replace(
              "/recommend/pilldetail"
            )
          }
          style={styles.stateButton}
        >
          <Text
            style={styles.stateButtonText}
          >
            다시 시도
          </Text>
        </Pressable>
      </View>
    );
  }

  if (data.length === 0 || !selected) {
    return (
      <View
        style={[
          styles.safe,
          styles.centerState,
        ]}
      >
        <Ionicons
          name="leaf-outline"
          size={48}
          color={"#ccc"}
        />

        <Text style={styles.stateText}>
          추천 가능한 영양제가 아직 없어요
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              "/recommend/recommendation"
            )
          }
          style={styles.stateButton}
        >
          <Text
            style={styles.stateButtonText}
          >
            추천 화면으로 돌아가기
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
        title="영양성분"
        subtitle="현재 건강 상태 기반, 맞춤 영양성분 추천"
        onBack={() => router.push("/recommend/recommendation")}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* 리스트 */}
      <ScrollView
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={false}
      >
        {data.map((item) => {
          const isActive =
            selected?.id === item.id;

          return (
            <RecommendationCard
              key={item.id}
              isActive={isActive}
              onPress={() => openSheet(item)}
              title={item.name}
              subText={item.doseSummary}
            />
          );
        })}

        <View style={{ height: 220 }} />
      </ScrollView>

      {/* BottomSheet */}
      <RecommendationBottomSheet
        gesture={pan}
        animatedStyle={sheetStyle}
        sheetOpen={sheetOpen}
        contentBottomPadding={34}
      >
              <Text style={styles.sheetTitle}>
                {selected.name}
              </Text>

              <Text style={styles.sheetDose}>
                {selected.doseSummary}
              </Text>

              <Text style={styles.sheetDesc}>
                {selected.description}
              </Text>

              <View style={styles.divider} />

              <CautionBox
                title="주의사항"
                bullets={selected.cautions}
              />
      </RecommendationBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.card,
  },

  loadingText: {
    marginTop: 12,
    color: "#888",
    fontSize: 14,
  },

  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  stateText: {
    marginTop: 16,
    color: Colors.light.subtleText,
    fontSize: 15,
    textAlign: "center",
  },

  stateButton: {
    marginTop: 18,
    backgroundColor:
      Colors.light.primarySurface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  stateButtonText: {
    color: Colors.light.primaryStrong,
    fontSize: 14,
    fontWeight: "700",
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

  sheetDose: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },

  sheetDesc: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 24,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    paddingHorizontal: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginBottom: 18,
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
});
