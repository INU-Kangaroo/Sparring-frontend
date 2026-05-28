import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  ActivityIndicator,
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

import {
  fetchSupplementRecommendation,
  refreshSupplementRecommendation,
  Supplement,
} from "../api/recommendation";

import Colors from "@/constants/Colors";

const { height: H } = Dimensions.get("window");

const SHEET_TOP = 110;
const SHEET_BOTTOM = H - 170;

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
  const top = useSharedValue(SHEET_BOTTOM);

  const startTop =
    useSharedValue(SHEET_BOTTOM);

  const [sheetOpen, setSheetOpen] =
    useState(false);

  useAnimatedReaction(
    () => top.value,
    (v) => {
      runOnJS(setSheetOpen)(
        Math.abs(v - SHEET_TOP) < 10
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
        Math.max(nextTop, SHEET_TOP),
        SHEET_BOTTOM
      );
    })
    .onEnd((e) => {
      const mid =
        (SHEET_TOP + SHEET_BOTTOM) / 2;

      const shouldOpen =
        e.velocityY < -500
          ? true
          : top.value < mid;

      top.value = withSpring(
        shouldOpen
          ? SHEET_TOP
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
          color="#ccc"
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
          color="#ccc"
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.leftHeader}>
            <Pressable
              onPress={() =>
                router.push(
                  "/recommend/recommendation"
                )
              }
              style={styles.backBtn}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color="#111"
              />
            </Pressable>

            <Text style={styles.headerTitle}>
              영양성분
            </Text>
          </View>

          <Pressable
            onPress={handleRefresh}
            style={styles.refreshBtn}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color={
                  Colors.light.primaryStrong
                }
              />
            ) : (
              <Ionicons
                name="refresh"
                size={20}
                color={
                  Colors.light.primaryStrong
                }
              />
            )}
          </Pressable>
        </View>

        <Text style={styles.h2}>
          현재 건강 상태 기반, 맞춤 영양성분 추천
        </Text>
      </View>

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
            <Pressable
              key={item.id}
              onPress={() =>
                setSelected(item)
              }
              style={({ pressed }) => [
                pressed && {
                  opacity: 0.85,
                },
              ]}
            >
              {isActive ? (
                <LinearGradient
                  colors={[
                    Colors.light.primary,
                    Colors.light
                      .primaryStrong,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnActive}
                >
                  <Text
                    style={
                      styles.btnNameActive
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.btnDoseActive
                    }
                  >
                    {item.doseSummary}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={
                    styles.btnInactive
                  }
                >
                  <Text style={styles.btnName}>
                    {item.name}
                  </Text>

                  <Text style={styles.btnDose}>
                    {item.doseSummary}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}

        <View style={{ height: 220 }} />
      </ScrollView>

      {/* BottomSheet */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.sheet, sheetStyle]}
        >
          <LinearGradient
            colors={[
              Colors.light.primaryMuted,
              Colors.light
                .primarySurfaceStrong,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sheetGradient}
          >
            <View style={styles.sheetHandle} />

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              scrollEnabled={sheetOpen}
              nestedScrollEnabled
              contentContainerStyle={
                styles.sheetScrollContent
              }
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

              <View style={{ height: 140 }} />
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
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

  header: {
    paddingHorizontal: 24,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: {
    paddingRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor:
      Colors.light.primarySurface,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
  },

  h2: {
    marginLeft: 10,
    marginBottom: 20,
    fontSize: 15,
    color: Colors.light.subtleText,
    lineHeight: 22,
  },

  listContent: {
    paddingHorizontal: 24,
    gap: 12,
    paddingTop: 4,
  },

  btnActive: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor:
      Colors.light.primaryStrong,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },

  btnInactive: {
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  btnNameActive: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 22,
  },

  btnDoseActive: {
    marginTop: 5,
    fontSize: 12.5,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
  },

  btnName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    lineHeight: 22,
  },
  btnDose: {
    marginTop: 5,
    fontSize: 12.5,
    fontWeight: "500",
    color: "#888",
    lineHeight: 18,
  },

  // BottomSheet
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    maxHeight: H - 80,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  sheetGradient: {
    flex: 1,
    paddingTop: 10,
    minHeight: H,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 90,
    height: 6,
    borderRadius: 3,
    backgroundColor:
      "rgba(255,255,255,0.9)",
    marginBottom: 22,
  },

  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  sheetTitle: {
    fontSize: 18,
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
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 24,
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    paddingHorizontal: 10,
  },

  divider: {
    height: 1,
    backgroundColor:
      "rgba(255,255,255,0.4)",
    marginVertical: 20,
  },

  cautionBox: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#D99197",
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