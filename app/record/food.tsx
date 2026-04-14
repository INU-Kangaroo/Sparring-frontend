import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import BackButton from "@/components/BackButton";
import RecordBox from "@/components/RecordBox";
import Colors from "@/constants/Colors";
import {
  searchFoods,
  getFoodDetail,
  createFoodLog,
  getFoodLogsDaily,
  type FoodSearchResult,
  type FoodDetail,
} from "../api/foods";

const pad2 = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const getServingText = (item: {
  foodWeight?: string;
  refIntakeAmount?: string;
  servingSize?: number;
  servingUnit?: string;
}) =>
  item.foodWeight ||
  item.refIntakeAmount ||
  (item.servingSize != null && item.servingUnit
    ? `${item.servingSize}${item.servingUnit}`
    : item.servingSize != null
      ? String(item.servingSize)
      : "-");

const toNutritionText = (value?: number, unit = "g") =>
  value == null ? "-" : `${value}${unit}`;

export default function FoodRecordScreen() {
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const selectedYmd = useMemo(() => toYmd(date), [date]);

  const [logs, setLogs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedFood, setSelectedFood] = useState<FoodDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [eatenAmount, setEatenAmount] = useState("100");
  const [mealTime, setMealTime] = useState("BREAKFAST");

  const fetchDaily = async () => {
    try {
      setFetching(true);
      const raw = await getFoodLogsDaily(selectedYmd);
      const normalized = Array.isArray(raw)
        ? raw
        : (raw as any)?.logs ?? (raw as any)?.data ?? [];
      setLogs(normalized);
    } catch (error: any) {
      console.log("getFoodLogsDaily error", error);
      Alert.alert("불러오기 실패", "음식 기록을 불러오지 못했습니다.");
      setLogs([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, [selectedYmd]);

  const onSearch = async () => {
    if (!keyword.trim()) {
      Alert.alert("검색어를 입력하세요");
      return;
    }

    try {
      setSearchLoading(true);
      const data = await searchFoods(keyword.trim(), 0, 20);
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.log("searchFoods error", error);
      Alert.alert("검색 실패", "음식 검색에 실패했습니다.");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const onSelectFood = async (item: FoodSearchResult) => {
    try {
      setDetailLoading(true);
      const detail = await getFoodDetail(item.id);
      setSelectedFood(detail);
    } catch (error: any) {
      console.log("getFoodDetail error", error);
      Alert.alert("상세 조회 실패", "음식 상세 정보를 불러오지 못했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  const onSaveLog = async () => {
    if (!selectedFood) {
      Alert.alert("음식을 선택해주세요.");
      return;
    }

    const grams = Number(eatenAmount);
    if (!Number.isFinite(grams) || grams <= 0) {
      Alert.alert("섭취량을 올바르게 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      await createFoodLog({
        foodId: selectedFood.id,
        mealTime,
        loggedAt: new Date().toISOString(),
        eatenAmountGram: grams,
      });
      await fetchDaily();
      Alert.alert("저장 완료", "음식 기록이 저장되었습니다.");
    } catch (error: any) {
      console.log("createFoodLog error", error);
      Alert.alert("저장 실패", "음식 기록 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackButton onPress={() => router.replace("/main/main")} />
        <Text style={styles.title}>음식 기록</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.weekRow}>
          <Pressable
            style={styles.dateBtn}
            onPress={() => setShowDatePicker((prev) => !prev)}
          >
            <LinearGradient
              colors={[Colors.light.secondary, Colors.light.ink]}
              style={styles.datePill}
            >
              <Ionicons name="calendar" size={14} color={Colors.light.card} />
              <Text style={styles.dateText}>{selectedYmd}</Text>
            </LinearGradient>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "compact" : "default"}
              onChange={(event, selected) => {
                if ((event as any)?.type === "dismissed") {
                  setShowDatePicker(false);
                  return;
                }
                if (selected) setDate(selected);
                if (Platform.OS !== "ios") setShowDatePicker(false);
              }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1) 음식 검색</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={keyword}
              onChangeText={setKeyword}
              placeholder="음식명 입력"
              returnKeyType="search"
              onSubmitEditing={onSearch}
            />
            <Pressable style={styles.searchBtn} onPress={onSearch}>
              <Text style={styles.searchBtnText}>검색</Text>
            </Pressable>
          </View>

          {searchLoading && <ActivityIndicator style={{ marginVertical: 8 }} />}

          {searchResults.map((item) => (
            <Pressable
              key={`${item.id}-${item.name}`}
              onPress={() => onSelectFood(item)}
              style={[
                styles.card,
                selectedFood?.id === item.id && styles.selectedCard,
              ]}
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{`${item.calories} kcal • ${getServingText(item)}`}</Text>
            </Pressable>
          ))}

          {selectedFood && (
            <View style={styles.detailBlock}>
              <Text style={styles.detailTitle}>선택된 음식</Text>
              {detailLoading ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Text style={styles.detailName}>{selectedFood.name}</Text>
                  <Text style={styles.detailText}>{`칼로리: ${selectedFood.calories} kcal`}</Text>
                  <Text style={styles.detailText}>{`기준량: ${getServingText(selectedFood)}`}</Text>
                  {selectedFood.foodOrigin || selectedFood.manufacturer ? (
                    <Text style={styles.detailText}>
                      {[
                        selectedFood.foodOrigin ? `원산지 ${selectedFood.foodOrigin}` : null,
                        selectedFood.manufacturer ? `제조사 ${selectedFood.manufacturer}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  ) : null}
                  {(selectedFood.categoryLarge || selectedFood.categoryMedium) ? (
                    <Text style={styles.detailText}>
                      {[
                        selectedFood.categoryLarge,
                        selectedFood.categoryMedium,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  ) : null}
                  <Text style={styles.detailText}>
                    {`탄수화물 ${toNutritionText(selectedFood.carbs)} · 당류 ${toNutritionText(selectedFood.sugar)} · 식이섬유 ${toNutritionText(selectedFood.fiber)}`}
                  </Text>
                  <Text style={styles.detailText}>
                    {`단백질 ${toNutritionText(selectedFood.protein)} · 지방 ${toNutritionText(selectedFood.fat)} · 포화지방 ${toNutritionText(selectedFood.saturatedFat)}`}
                  </Text>
                  <Text style={styles.detailText}>
                    {`트랜스지방 ${toNutritionText(selectedFood.transFat)} · 콜레스테롤 ${toNutritionText(selectedFood.cholesterol, "mg")} · 나트륨 ${toNutritionText(selectedFood.sodium, "mg")}`}
                  </Text>
                  {(selectedFood.calcium != null ||
                    selectedFood.iron != null ||
                    selectedFood.potassium != null) ? (
                    <Text style={styles.detailText}>
                      {`칼슘 ${toNutritionText(selectedFood.calcium, "mg")} · 철 ${toNutritionText(selectedFood.iron, "mg")} · 칼륨 ${toNutritionText(selectedFood.potassium, "mg")}`}
                    </Text>
                  ) : null}
                </>
              )}

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={eatenAmount}
                  onChangeText={setEatenAmount}
                  keyboardType="numeric"
                  placeholder="섭취량(g)"
                />
                <Pressable style={styles.logBtn} onPress={onSaveLog}>
                  <Text style={styles.logBtnText}>{saving ? "저장중..." : "기록"}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2) 일별 로그</Text>
          {fetching ? (
            <ActivityIndicator />
          ) : logs.length === 0 ? (
            <Text style={styles.emptyText}>오늘 기록된 음식이 없습니다.</Text>
          ) : (
            logs.map((item) => (
              <RecordBox
                key={item.id}
                title={`${item.foodName ?? item.name ?? "알 수 없음"} (${item.mealTime ?? "-"})`}
                time={(item.loggedAt ?? item.eatenAt)
                  ? (item.loggedAt ?? item.eatenAt).replace("T", " ").slice(0, 16)
                  : "-"}
                value={`${item.eatenAmountGram ?? item.eatenAmount ?? 0} g`}
                fullWidth
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background },
  header: { flexDirection: "row", alignItems: "center", padding: 16 },
  title: { fontSize: 18, fontWeight: "700", flex: 1, textAlign: "center", color: Colors.light.text },
  container: { paddingHorizontal: 16, paddingBottom: 120 },
  weekRow: { marginBottom: 16, alignItems: "center" },
  dateBtn: { width: "100%" },
  datePill: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 24, paddingVertical: 10 },
  dateText: { color: Colors.light.card, marginLeft: 6, fontWeight: "600" },
  section: { marginBottom: 16, backgroundColor: Colors.light.card, borderRadius: 16, padding: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8, color: Colors.light.text },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
  },
  searchBtn: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    justifyContent: "center",
  },
  searchBtnText: { color: Colors.light.card, fontWeight: "700" },
  logBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 42,
    justifyContent: "center",
  },
  logBtnText: { color: Colors.light.card, fontWeight: "700" },
  card: { marginBottom: 8, borderRadius: 10, backgroundColor: Colors.light.mutedBackground, padding: 10 },
  selectedCard: { borderColor: Colors.light.primary, borderWidth: 2 },
  cardTitle: { fontWeight: "700", fontSize: 14, color: Colors.light.text },
  cardSub: { color: Colors.light.subtleText, marginTop: 2 },
  detailBlock: { marginTop: 6, padding: 8, backgroundColor: Colors.light.background, borderRadius: 10 },
  detailTitle: { fontWeight: "700", marginBottom: 6, color: Colors.light.text },
  detailName: { fontWeight: "700", fontSize: 16, color: Colors.light.text },
  detailText: { fontSize: 13, color: Colors.light.subtleText },
  emptyText: { color: Colors.light.subtleText, paddingVertical: 12 },
});
