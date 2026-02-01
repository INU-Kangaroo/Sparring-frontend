import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { router } from "expo-router";

type Option = { id: string; label: string };

const PRETENDARD = "Pretendard";
const PRETENDARD_MEDIUM = "Pretendard-Medium";

function toggleSet(prev: Set<string>, id: string) {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

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

  // ✅ 멀티 선택
  const [selected, setSelected] = useState<Set<string>>(new Set(["dairy"]));

  const isNoneSelected = selected.has("none");

  const onPressNone = () => {
    setSelected((prev) => {
      // none을 켜면 다른 선택은 모두 해제하고 none만 남김
      if (prev.has("none")) return new Set(); // 다시 누르면 해제
      return new Set(["none"]);
    });
  };

  const onPressChip = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);

      // 다른 항목을 고르면 none은 자동 해제
      next.delete("none");

      // 토글
      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  const onSave = () => {
    // TODO: selected를 저장/전달 (나중에)
    router.push("/recommend/recommendation");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>필터 선택하기</Text>
      <Text style={styles.subtitle}>필터 선택하기</Text>

      <View style={{ height: 78 }} />

      <Text style={styles.desc}>선호하는 음식 카테고리를 골라주세요.</Text>

      {/* ✅ '없음' 단독 줄 (왼쪽 정렬) */}
      <View style={styles.noneRow}>
        <Chip
          label={noneOption.label}
          active={isNoneSelected}
          onPress={onPressNone}
        />
      </View>

      {/* ✅ 아래는 3열 그리드 */}
      <FlatList
        data={options}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
          <Chip
            label={item.label}
            active={selected.has(item.id)}
            onPress={() => onPressChip(item.id)}
          />
        )}
      />

      {/* ✅ 저장 버튼 */}
      <Pressable style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>저장</Text>
      </Pressable>
    </View>
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
      <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
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
    paddingTop: 60,
  },

  // ✅ 필터 선택하기 Bold ,25 (두껍게)
  title: {
    fontSize: 25,
    color: "#000000",
    fontFamily: PRETENDARD,
    fontWeight: "800",
  },

  // medium, 18
  subtitle: {
    marginTop: 10,
    fontSize: 18,
    color: "#000000",
    fontFamily: PRETENDARD_MEDIUM,
  },

  // medium, 16
  desc: {
    fontSize: 16,
    color: "#000000",
    fontFamily: PRETENDARD_MEDIUM,
  },

  // ✅ 없음은 왼쪽 오이 위(단독 줄)
  noneRow: {
    marginTop: 26,
    alignItems: "flex-start", // 🔥 왼쪽
  },

  // ✅ 그리드
  grid: {
    marginTop: 14,
    paddingBottom: 90,
  },
  gridRow: {
    justifyContent: "flex-start", // 🔥 왼쪽 정렬
    gap: 14,
    marginBottom: 14,
  },

  // 칩: W90 H44 radius20
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
    backgroundColor: "#0D99FF",
  },

  chipText: {
    fontSize: 15,
    fontFamily: PRETENDARD_MEDIUM,
  },
  chipTextInactive: { color: "#000000" },
  chipTextActive: { color: "#FFFFFF" },

  // 저장 버튼: W129 H44 radius20 bg #3D3D3D
  saveBtn: {
    position: "absolute",
    bottom: 34,
    alignSelf: "center",
    width: 129,
    height: 44,
    borderRadius: 20,
    backgroundColor: "#3D3D3D",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: PRETENDARD_MEDIUM,
  },
});
