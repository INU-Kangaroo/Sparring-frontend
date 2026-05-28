import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import Svg, { Polyline, Line, Text as SvgText, Circle, Defs, LinearGradient as SvgGradient, Stop, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import {
  refreshFoodRecommendation,
  type FoodRecommendationRequest,
  type FoodRecommendationResponse,
} from "../api/recommendation";
import { predictBloodSugar, type BloodSugarPredictionResponse } from "../api/prediction";
import Colors from "@/constants/Colors";
import RecommendationHeader from "./components/RecommendationHeader";
import RecommendationCard from "./components/RecommendationCard";
import RecommendationBottomSheet from "./components/RecommendationBottomSheet";

const { width: W } = Dimensions.get("window");

function clamp(v: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(v, min), max);
}

type DietItem = {
  id: string;
  foodId?: number;
  name: string;
  kcal: number;
  servingText: string;
  menuSummary: string;
  origin?: string;
  categoryText?: string;
  carbs: string;
  sugar: string;
  fiber: string;
  protein: string;
  fat: string;
  saturatedFat: string;
  transFat: string;
  cholesterol: string;
  sodium: string;
  reasons: string[];
  glucoseFriendlyScore: number;
  reactionLevel: string;
  reactionTags: string[];
  menus: {
    id: string;
    name: string;
    kcal: string;
  }[];
};

const ALLERGY_KEYWORD_MAP: Record<string, string[]> = {
  cucumber: ["오이", "cucumber"],
  egg: ["계란", "달걀", "달걀말이", "지단", "메추리알", "egg"],
  peach: ["복숭아", "peach"],
  watermelon: ["수박", "watermelon"],
  dairy: ["우유", "치즈", "요거트", "버터", "크림", "유제품", "milk", "cheese", "yogurt"],
  nuts: ["견과", "아몬드", "호두", "땅콩", "캐슈", "nuts", "nut", "peanut", "almond", "walnut"],
  meat: [
    "육류",
    "고기",
    "소고기",
    "돼지고기",
    "닭고기",
    "닭",
    "닭가슴살",
    "불고기",
    "갈비",
    "햄",
    "베이컨",
    "소시지",
    "오리",
    "beef",
    "pork",
    "chicken",
    "meat",
    "bacon",
    "sausage",
    "duck",
  ],
  fish: ["생선", "연어", "고등어", "참치", "멸치", "fish", "salmon", "tuna", "mackerel", "anchovy"],
  bean: ["콩", "두부", "된장", "청국장", "soya", "soy", "bean", "tofu"],
  flour: ["밀", "밀가루", "빵", "면", "파스타", "부침가루", "wheat", "flour", "bread", "noodle", "pasta"],
  crustacean: ["갑각류", "새우", "게", "랍스터", "shrimp", "crab", "lobster"],
};

const DEFAULT_GLUCOSE_CURVE = [
  { t: 0, v: 92 },
  { t: 15, v: 108 },
  { t: 30, v: 126 },
  { t: 45, v: 138 },
  { t: 60, v: 129 },
  { t: 90, v: 110 },
  { t: 120, v: 96 },
];

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toMealTypeLabel(value: string): "breakfast" | "lunch" | "dinner" | "snack" {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "lunch" || normalized === "dinner" || normalized === "snack") {
    return normalized;
  }
  return "breakfast";
}

function toMacroText(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? `${parsed}g` : String(value ?? "-");
}

function toServingText(item: Record<string, any>) {
  if (item.foodWeight) return String(item.foodWeight);
  if (item.refIntakeAmount) return String(item.refIntakeAmount);
  return "1인분";
}

function summarizeMenus(rawMenus: any[] = []) {
  const menus = rawMenus
    .map((menu) => String(menu?.name ?? "").trim())
    .filter(Boolean);

  if (menus.length === 0) return "메뉴 구성 없음";
  if (menus.length === 1) return menus[0];
  return `${menus[0]} 외 ${menus.length - 1}개`;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyCurrentGlucose(
  data: { t: number; v: number }[],
  currentGlucose?: number
) {
  if (!Number.isFinite(currentGlucose) || data.length === 0) {
    return data;
  }

  const delta = Number(currentGlucose) - data[0].v;
  return data.map((entry, index) => ({
    ...entry,
    v: index === 0 ? Number(currentGlucose) : Math.max(60, Math.round(entry.v + delta * 0.45)),
  }));
}

function toGlucoseData(raw: unknown) {
  if (!Array.isArray(raw)) return DEFAULT_GLUCOSE_CURVE;

  const mapped = raw
    .map((entry: any, index: number) => {
      if (Array.isArray(entry) && entry.length >= 2) {
        return { t: toNumber(entry[0]), v: toNumber(entry[1]) };
      }

      const t = toNumber(entry?.t ?? entry?.offsetMinutes ?? entry?.time ?? entry?.minute ?? index * 15);
      const v = toNumber(entry?.v ?? entry?.predictedGlucose ?? entry?.value ?? entry?.glucose ?? entry?.bloodSugar);
      if (!Number.isFinite(t) || !Number.isFinite(v) || v <= 0) return null;
      return { t, v };
    })
    .filter(Boolean) as { t: number; v: number }[];

  return mapped.length > 0 ? mapped : DEFAULT_GLUCOSE_CURVE;
}

function normalizeFoodItems(payload: FoodRecommendationResponse | null): DietItem[] {
  const rawItems =
    payload?.foods ??
    payload?.recommendations ??
    payload?.items ??
    [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems.map((item: any, index) => {
    const normalizedItem = item ?? {};
    const nutrients = normalizedItem?.nutrients ?? {};
    const menus = Array.isArray(normalizedItem?.menus) ? normalizedItem.menus : [];
    const firstMenuId = menus.find((menu: any) => Number.isFinite(Number(menu?.id)))?.id;
    const isCardResponse = normalizedItem?.title || menus.length > 0 || normalizedItem?.recommendationCardId;

    return {
      glucoseFriendlyScore: Number(normalizedItem?.glucoseFriendlyScore ?? 0),
      reactionLevel: String(normalizedItem?.reactionLevel ?? ""),
      reactionTags: Array.isArray(normalizedItem?.reactionTags)
        ? normalizedItem.reactionTags.map(String)
        : [],
      id: String(normalizedItem?.recommendationCardId ?? normalizedItem?.foodId ?? index),
      foodId: Number.isFinite(Number(normalizedItem?.foodId))
        ? Number(normalizedItem.foodId)
        : Number.isFinite(Number(firstMenuId))
          ? Number(firstMenuId)
          : undefined,
      name: String(
        normalizedItem?.title ??
          normalizedItem?.foodName ??
          `추천 음식 ${index + 1}`
      ),
      kcal: toNumber(nutrients?.kcal ?? normalizedItem?.calories),
      servingText: isCardResponse ? summarizeMenus(menus) : toServingText(normalizedItem),
      menuSummary: summarizeMenus(menus),
      origin: normalizedItem?.foodOrigin ? String(normalizedItem.foodOrigin) : undefined,
      categoryText: [normalizedItem?.categoryLarge, normalizedItem?.categoryMedium].filter(Boolean).join(" · "),
      carbs: toMacroText(nutrients?.carbs ?? normalizedItem?.carbs),
      sugar: toMacroText(nutrients?.sugar ?? normalizedItem?.sugar),
      fiber: toMacroText(nutrients?.fiber ?? normalizedItem?.fiber),
      protein: toMacroText(nutrients?.protein ?? normalizedItem?.protein),
      fat: toMacroText(nutrients?.fat ?? normalizedItem?.fat),
      saturatedFat: toMacroText(nutrients?.saturatedFat ?? normalizedItem?.saturatedFat),
      transFat: toMacroText(nutrients?.transFat ?? normalizedItem?.transFat),
      cholesterol: toMacroText(nutrients?.cholesterol ?? normalizedItem?.cholesterol),
      sodium: toMacroText(nutrients?.sodium ?? normalizedItem?.sodium),
      reasons: Array.isArray(normalizedItem?.reasons) ? normalizedItem.reasons.map(String) : [],
      menus: menus.map((menu: any, menuIndex: number) => ({
        id: String(menu?.id ?? menuIndex),
        name: String(menu?.name ?? `메뉴 ${menuIndex + 1}`),
        kcal: `${toNumber(menu?.kcal)}kcal`,
      })),
    };
  });
}

function filterFoodItemsByAllergies(items: DietItem[], allergyIds: string[]) {
  if (allergyIds.length === 0) {
    return items;
  }

  return items.filter((item) => {
    const haystack = [
      item.name,
      item.menuSummary,
      item.servingText,
      ...item.menus.map((menu) => menu.name),
    ]
      .join(" ")
      .toLowerCase();

    return !allergyIds.some((allergyId) => {
      const keywords = ALLERGY_KEYWORD_MAP[allergyId] ?? [];
      return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
    });
  });
}

function tokenizeFoodItem(item: DietItem) {
  return [
    item.name,
    ...item.menus.map((menu) => menu.name),
  ]
    .join(" ")
    .split(/[+\s,()/]+/)
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length >= 2);
}

function dedupeSimilarFoodItems(items: DietItem[]) {
  const deduped: DietItem[] = [];

  for (const item of items) {
    const currentTokens = new Set(tokenizeFoodItem(item));

    const isTooSimilar = deduped.some((existing) => {
      const existingTokens = new Set(tokenizeFoodItem(existing));
      const intersection = [...currentTokens].filter((token) =>
        existingTokens.has(token)
      ).length;
      const base = Math.max(currentTokens.size, existingTokens.size, 1);
      const overlapRatio = intersection / base;
      const kcalDiff = Math.abs(item.kcal - existing.kcal);

      return overlapRatio >= 0.7 && kcalDiff <= 40;
    });

    if (!isTooSimilar) {
      deduped.push(item);
    }
  }

  return deduped;
}

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
  const preferredXTickMinutes = [0, 30, 60, 90, 120];
  const xLabels = preferredXTickMinutes.reduce<{ t: number; v: number }[]>((acc, minute) => {
    const nearest = data.reduce<{ t: number; v: number } | null>((best, entry) => {
      if (!best) return entry;
      return Math.abs(entry.t - minute) < Math.abs(best.t - minute) ? entry : best;
    }, null);

    if (!nearest) return acc;
    if (acc.some((entry) => entry.t === nearest.t)) return acc;
    return [...acc, nearest];
  }, []);

  return (
    <Svg width={GRAPH_W} height={GRAPH_H}>
      <Defs>
        <SvgGradient
          id="areaGrad"
          x1="0"
          y1={String(PAD_T)}
          x2="0"
          y2={String(PAD_T + innerH)}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.5} />
          <Stop offset="55%" stopColor="#FFFFFF" stopOpacity={0.25} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
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
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <SvgText
            x={PAD_L - 4}
            y={toY(v) + 4}
            fontSize={9}
            fill="rgba(255,255,255,0.58)"
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
        stroke="rgba(255,255,255,0.28)"
        strokeWidth={1}
      />

      {/* x축 레이블 */}
      {xLabels.map((d) => (
        <SvgText
          key={d.t}
          x={toX(d.t)}
          y={PAD_T + innerH + 14}
          fontSize={9}
          fill="rgba(255,255,255,0.58)"
          textAnchor="middle"
        >
          +{d.t}분
        </SvgText>
      ))}

      {/* 선 */}
      <Polyline
        points={points}
        fill="none"
        stroke="rgba(255,255,255,0.94)"
        strokeWidth={2.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* 포인트 */}
      {data.map((d, i) => (
        <Circle
          key={i}
          cx={toX(d.t)}
          cy={toY(d.v)}
          r={3.2}
          fill="rgba(255,255,255,0.95)"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.2}
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

function hasNutrientValue(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "-" || raw.toLowerCase() === "nan") return false;
  const n = Number(raw.replace(/[^\d.-]/g, ""));
  if (Number.isFinite(n) && n <= 0) return false;
  return true;
}

export default function DietRecommendScreen() {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    data?: string;
    currentGlucose?: string;
    mealType?: string;
    allergies?: string;
  }>();
  const selectedAllergies = useMemo<string[]>(() => {
    try {
      const parsed = JSON.parse(String(params.allergies ?? "[]"));
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }, [params.allergies]);
  const rawData = useMemo<DietItem[]>(() => {
    try {
      const parsed = JSON.parse(params.data ?? "{}") as FoodRecommendationResponse;
      const normalized = normalizeFoodItems(parsed);
      return normalized.length > 0 ? normalized : [];
    } catch {
      return [];
    }
  }, [params.data]);
  const data = useMemo(
    () => dedupeSimilarFoodItems(filterFoodItemsByAllergies(rawData, selectedAllergies)),
    [rawData, selectedAllergies]
  );

  const [selected, setSelected] = useState<DietItem | null>(data[0] ?? null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [predictionGraph, setPredictionGraph] = useState(DEFAULT_GLUCOSE_CURVE);
  const [refreshing, setRefreshing] = useState(false);
  const [predictionSummary, setPredictionSummary] = useState<{
    peakGlucose?: number;
    peakOffsetMinutes?: number;
    peakTime?: string;
  } | null>(null);
  const currentGlucose = useMemo(() => {
    const rawValue = String(params.currentGlucose ?? "").trim();
    if (!rawValue) {
      return undefined;
    }
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [params.currentGlucose]);
  const mealType = useMemo<FoodRecommendationRequest["mealType"]>(
    () => toMealTypeLabel(String(params.mealType ?? "")),
    [params.mealType]
  );

  useEffect(() => {
    setSelected(data[0] ?? null);
  }, [data]);

  // ── Bottom Sheet ──────────────────────────────────────────
  const SHEET_TOP = 110;
  const SHEET_BOTTOM = Math.max(160, screenHeight - 170);

  const top = useSharedValue(SHEET_BOTTOM);
  const startTop = useSharedValue(SHEET_BOTTOM);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    top.value = SHEET_BOTTOM;
  }, [SHEET_BOTTOM, top]);

  useAnimatedReaction(
    () => top.value,
    (v) => {
      runOnJS(setSheetOpen)(Math.abs(v - SHEET_TOP) <= 6);
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

  const nutrientRows = useMemo(
    () =>
      [
        { label: "탄수화물", value: selected?.carbs ?? "-" },
        { label: "당류", value: selected?.sugar ?? "-" },
        { label: "식이섬유", value: selected?.fiber ?? "-" },
        { label: "단백질", value: selected?.protein ?? "-" },
        { label: "지방", value: selected?.fat ?? "-" },
        { label: "포화지방", value: selected?.saturatedFat ?? "-" },
        { label: "트랜스지방", value: selected?.transFat ?? "-" },
        { label: "콜레스테롤", value: selected?.cholesterol ?? "-" },
        { label: "나트륨", value: selected?.sodium ?? "-" },
      ].filter((item) => hasNutrientValue(item.value)),
    [selected]
  );

  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      const result = await refreshFoodRecommendation({ mealType });
      router.replace({
        pathname: "/recommend/fooddetail",
        params: {
          data: JSON.stringify(result),
          mealType,
          currentGlucose: String(params.currentGlucose ?? ""),
          allergies: String(params.allergies ?? "[]"),
        },
      });
    } catch (error) {
      console.error("food recommendation refresh error", error);
      alert("음식 추천 새로고침에 실패했어요.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadPrediction = async () => {
      const carbs = toNumber(selected?.carbs?.replace?.("g", "") ?? selected?.carbs);
      const protein = toNumber(selected?.protein?.replace?.("g", "") ?? selected?.protein);
      const fat = toNumber(selected?.fat?.replace?.("g", "") ?? selected?.fat);
      const fiber = toNumber(selected?.fiber?.replace?.("g", "") ?? selected?.fiber);
      const kcal = toNumber(selected?.kcal);

      if (!selected || kcal <= 0) {
        if (!mounted) return;
        setPredictionGraph(DEFAULT_GLUCOSE_CURVE);
        setPredictionSummary(null);
        setPredictionError("예측에 필요한 식단 정보가 부족해요.");
        return;
      }

      try {
        if (mounted) {
          setPredictionLoading(true);
          setPredictionError(null);
        }

        const res: BloodSugarPredictionResponse = await predictBloodSugar({
          meal: {
            carbs,
            protein,
            fat,
            fiber,
            kcal,
            mealType,
          },
        });

        if (!mounted) return;

        setPredictionGraph(
          applyCurrentGlucose(toGlucoseData(res.curve ?? res.forecast), currentGlucose)
        );
        setPredictionSummary({
          peakGlucose: res.peak?.peakGlucose ?? res.peakGlucose ?? res.predictedGlucose,
          peakOffsetMinutes:
            res.peak?.peakOffsetMinutes ??
            res.peakMinute ??
            res.peakOffsetMinutes ??
            res.predictionOffsetMinutes,
          peakTime: res.peak?.peakTime ?? res.predictedTime,
        });
      } catch (error) {
        console.log("blood sugar prediction error", error);
        if (!mounted) return;
        setPredictionGraph(applyCurrentGlucose(DEFAULT_GLUCOSE_CURVE, currentGlucose));
        setPredictionSummary(null);
        setPredictionError("혈당 예측을 불러오지 못해 기본 그래프로 보여드려요.");
      } finally {
        if (mounted) {
          setPredictionLoading(false);
        }
      }
    };

    loadPrediction();

    return () => {
      mounted = false;
    };
  }, [currentGlucose, mealType, selected]);

  if (!params.data) {
    return (
      <View style={[styles.safe, styles.centerState]}>
        <Ionicons name="restaurant-outline" size={48} color="#ccc" />
        <Text style={styles.stateText}>먼저 음식 추천 필터를 선택해 주세요</Text>
        <Pressable onPress={() => router.push("/recommend/foodfilter")} style={styles.stateButton}>
          <Text style={styles.stateButtonText}>필터 선택하러 가기</Text>
        </Pressable>
      </View>
    );
  }

  if (!selected || data.length === 0) {
    return (
      <View style={[styles.safe, styles.centerState]}>
        <Ionicons name="restaurant-outline" size={48} color="#ccc" />
        <Text style={styles.stateText}>
          {selectedAllergies.length > 0
            ? "선택한 알러지 조건을 제외하면 추천 가능한 음식이 없어요"
            : "추천 가능한 음식이 아직 없어요"}
        </Text>
        <Pressable onPress={() => router.push("/recommend/foodfilter")} style={styles.stateButton}>
          <Text style={styles.stateButtonText}>필터 다시 선택하기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 40 }]}>
      <RecommendationHeader
        title="식단"
        subtitle="현재 건강 상태 기반, 맞춤 식단 추천"
        onBack={() => router.push("/recommend/recommendation")}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* 음식 버튼 리스트 */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {data.map((item) => {
          const isActive = selected.id === item.id;
          return (
            <RecommendationCard
              key={item.id}
              isActive={isActive}
              onPress={() => openSheet(item)}
              title={item.name}
              rightText={`${item.kcal}kcal`}
              subText={item.reactionTags.length > 0 ? item.reactionTags.join(" · ") : undefined}
              subText2={item.menuSummary}
            />
          );
        })}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* 바텀 시트 */}
      <RecommendationBottomSheet
        gesture={pan}
        animatedStyle={sheetStyle}
        sheetOpen={sheetOpen}
        dragOnHandleOnly
        contentBottomPadding={34}
      >
              {/* 음식 이름 + kcal */}
              <Text style={styles.sheetTitle}>{selected.name}</Text>
              <Text style={styles.sheetKcal}>{selected.kcal}kcal</Text>
              <Text style={styles.sheetServing}>{selected.servingText}</Text>
              {selected.origin || selected.categoryText ? (
                <Text style={styles.sheetMeta}>
                  {[selected.origin, selected.categoryText].filter(Boolean).join(" | ")}
                </Text>
              ) : null}
              {selected.reactionTags.length > 0 ? (
                <View style={styles.detailTagWrap}>
                  {selected.reactionTags.map((tag) => (
                    <View key={`${selected.id}-${tag}`} style={styles.detailTag}>
                      <Text style={styles.detailTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* 혈당 그래프 */}
              <View style={styles.graphSection}>
                <Text style={styles.graphLabel}>예상 식후 혈당 반응</Text>
                <View style={styles.graphBox}>
                  {predictionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <GlucoseGraph data={predictionGraph} />
                  )}
                </View>
                {predictionSummary?.peakGlucose != null ? (
                  <View style={styles.peakCard}>
                    <Text style={styles.peakTitle}>식후 상승 경향</Text>
                    <Text style={styles.peakValue}>
                      {predictionSummary.peakGlucose} mg/dL
                    </Text>
                    <Text style={styles.peakMeta}>
                      {predictionSummary.peakOffsetMinutes != null
                        ? `${predictionSummary.peakOffsetMinutes}분 뒤 반응`
                        : "예상 반응 시점"}
                      {predictionSummary.peakTime
                        ? ` · ${predictionSummary.peakTime.replace("T", " ").slice(0, 16)}`
                        : ""}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.graphCaption}>
                  {predictionError ??
                    `* 식후 반응 수준을 참고하는 그래프예요${currentGlucose ? " · 현재 혈당 입력값을 보조 반영했어요" : ""}`}
                </Text>
              </View>

              <View style={styles.divider} />

              {selected.menus.length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>메뉴 구성</Text>
                  <View style={styles.reasonWrap}>
                    {selected.menus.map((menu) => (
                      <View key={`${selected.id}-menu-${menu.id}`} style={styles.menuRow}>
                        <Text style={styles.menuName}>{menu.name}</Text>
                        <Text style={styles.menuKcal}>{menu.kcal}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.divider} />
                </>
              ) : null}

              {/* 영양성분 */}
              {nutrientRows.length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>영양성분</Text>
                  <View style={styles.nutrientsWrap}>
                    {nutrientRows.map((item) => (
                      <NutrientRow key={item.label} label={item.label} value={item.value} />
                    ))}
                  </View>
                </>
              ) : null}

              {selected.reasons.length > 0 ? (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionLabel}>이유 태그</Text>
                  <View style={styles.reasonWrap}>
                    {selected.reasons.map((reason, index) => (
                      <View key={`${selected.id}-reason-${index}`} style={styles.reasonRow}>
                        <Text style={styles.reasonBullet}>•</Text>
                        <Text style={styles.reasonText}>{reason}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}

      </RecommendationBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.card },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 14,
    fontSize: 15,
    color: Colors.light.subtleText,
    textAlign: "center",
  },
  stateButton: {
    marginTop: 18,
    backgroundColor: Colors.light.primaryStrong,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  stateButtonText: {
    color: "#fff",
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
    lineHeight: 28,
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
    color: "#9E8A88",
    textAlign: "center",
    marginBottom: 8,
  },
  sheetMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 18,
  },
  detailTagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 18,
  },
  detailTag: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailTagText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 11,
    fontWeight: "700",
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
  peakCard: {
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  peakTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
  },
  peakValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  peakMeta: {
    marginTop: 4,
    fontSize: 11,
    color: "#9E8A88",
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
    backgroundColor: "rgba(205, 125, 132, 0.75)",
    paddingHorizontal: 18,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nutrientLabel: { fontSize: 15, fontWeight: "700", color: "#fff" },
  nutrientValue: { fontSize: 15, fontWeight: "800", color: "#fff" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  menuName: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginRight: 12,
  },
  menuKcal: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontWeight: "600",
  },
  reasonWrap: { gap: 10 },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  reasonBullet: {
    color: "#fff",
    marginRight: 8,
    marginTop: 1,
    fontSize: 14,
  },
  reasonText: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    lineHeight: 20,
  },
});
