import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  TextInput,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchFoodRecommendation,
  type FoodRecommendationRequest,
} from "../api/recommendation";
import Colors from "@/constants/Colors";

type Option = { id: string; label: string };

const PRETENDARD = "Pretendard";
const PRETENDARD_MEDIUM = "Pretendard-Medium";

export default function FoodFilter() {
  const noneOption: Option = { id: "none", label: "없음" };

  const options = useMemo<Option[]>(
    () => [
      { id: "cucumber", label: "오이" },
      { id: "egg", label: "계란" },
      { id: "peach", label: "복숭아" },
      { id: "watermelon", label: "수박" },
      { id: "dairy", label: "유제품" },
      { id: "nuts", label: "견과류" },
      { id: "meat", label: "육류" },
      { id: "fish", label: "생선" },
      { id: "bean", label: "콩" },
      { id: "flour", label: "밀가루" },
      { id: "crustacean", label: "갑각류" },
      { id: "etc", label: "기타" },
    ],
    []
  );

  const mealTimes: Option[] = [
    { id: "morning", label: "아침" },
    { id: "lunch", label: "점심" },
    { id: "dinner", label: "저녁" },
  ];

  // 알러지 멀티 선택
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // 시간대 단일 선택
  const [selectedMeal, setSelectedMeal] = useState<string>("morning");
  const [loading, setLoading] = useState(false);
  const [currentGlucose, setCurrentGlucose] = useState("");

  const isNoneSelected = selected.has("none");

  const onPressNone = () => {
    setSelected((prev) => {
      if (prev.has("none")) return new Set();
      return new Set(["none"]);
    });
  };

  const onPressChip = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete("none");
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const MEAL_TIME_MAP: Record<string, FoodRecommendationRequest["mealType"]> = {
    morning: "breakfast",
    lunch: "lunch",
    dinner: "dinner",
    snack: "snack",
  };

  const onSave = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const result = await fetchFoodRecommendation({
        mealType: MEAL_TIME_MAP[selectedMeal] ?? "breakfast",
      });

      router.push({
        pathname: "/recommend/fooddetail",
        params: {
          data: JSON.stringify(result),
          mealType: MEAL_TIME_MAP[selectedMeal] ?? "breakfast",
          currentGlucose: currentGlucose.trim(),
          allergies: JSON.stringify(
            Array.from(selected).filter((item) => item !== "none")
          ),
        },
      });
    } catch (error) {
      console.error("food recommendation error", error);
      alert("음식 추천을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "white" }}
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>

        <Text style={styles.title}>식단 추천 받기 </Text>

      </View>

      <View style={styles.topSpacer} />

      {/* ── 시간대 선택 ── */}
      <Text style={styles.desc}>추천 받고 싶은 시간대를 선택해주세요.</Text>
      <View style={styles.mealRow}>
        {mealTimes.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => setSelectedMeal(m.id)}
            style={[
              styles.mealChip,
              selectedMeal === m.id ? styles.mealChipActive : styles.mealChipInactive,
            ]}
          >
            <Text
              style={[
                styles.mealChipText,
                selectedMeal === m.id
                  ? styles.mealChipTextActive
                  : styles.mealChipTextInactive,
              ]}
            >
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.desc}>현재 혈당은 선택 입력이에요. {'\n'}있으면 그래프 참고값으로만 반영돼요.</Text>
      <TextInput
        style={styles.glucoseInput}
        placeholder="예) 112"
        placeholderTextColor="#B8B8B8"
        value={currentGlucose}
        onChangeText={setCurrentGlucose}
        keyboardType="number-pad"
      />

      <View style={styles.divider} />

      {/* ── 알러지 선택 ── */}
      <Text style={styles.desc}>
        {"알러지가 있는 음식만 골라주세요. \n해당 음식은 추천에서 제외돼요."}
      </Text>
      <View style={styles.noneRow}>
        <Chip
          label={noneOption.label}
          active={isNoneSelected}
          onPress={onPressNone}
        />
      </View>

      <FlatList
        data={options}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        ListFooterComponent={<View style={styles.gridFooter} />}
        renderItem={({ item }) => (
          <Chip
            label={item.label}
            active={selected.has(item.id)}
            onPress={() => onPressChip(item.id)}
          />
        )}
      />

      <Pressable style={styles.saveBtn} onPress={onSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.saveText}>저장</Text>
        )}
      </Pressable>
    </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      <Text
        style={[
          styles.chipText,
          active ? styles.chipTextActive : styles.chipTextInactive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 22,
    paddingTop: 30,
  },
  headerRow: {
  marginTop: 50,
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  topSpacer: {
    height: 32,
  },

  title: {
    fontSize: 22,
    color: "#000000",
    fontFamily: PRETENDARD,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 18,
    color: "#000000",
    fontFamily: PRETENDARD_MEDIUM,
  },
  desc: {
    fontSize: 16,
    color: "#000000",
    fontFamily: PRETENDARD_MEDIUM,
  },

  // 시간대
  mealRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 4,
  },
  mealChip: {
    flex: 1,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mealChipActive: {
    backgroundColor: Colors.light.primaryStrong,
  },
  mealChipInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  mealChipText: {
    fontSize: 15,
    fontFamily: PRETENDARD_MEDIUM,
  },
  mealChipTextActive: { color: "#FFFFFF" },
  mealChipTextInactive: { color: "#000000" },
  glucoseInput: {
    marginTop: 14,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#FAFAFA",
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 20,
  },

  // 없음
  noneRow: {
    marginTop: 16,
    alignItems: "flex-start",
  },

  // 그리드
  grid: {
    marginTop: 14,
    paddingBottom: 24,
  },
  gridFooter: {
    height: 120,
  },
  gridRow: {
    justifyContent: "flex-start",
    gap: 28,
    marginBottom: 14,
  },

  // 카테고리 칩
  chip: {
    width: 90,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chipInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  chipActive: {
    backgroundColor: Colors.light.primaryStrong,
  },
  chipText: {
    fontSize: 15,
    fontFamily: PRETENDARD_MEDIUM,
  },
  chipTextInactive: { color: "#000000" },
  chipTextActive: { color: "#FFFFFF" },

  // 저장 버튼
 saveBtn: {
  marginTop: -130,
  width: 129,
  height: 44,
  borderRadius: 16,
  backgroundColor: "#3D3D3D",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "center",
},
  saveText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: PRETENDARD_MEDIUM,
  },
});