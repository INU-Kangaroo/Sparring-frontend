import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

type Option = { label: string; value: string };

function SegmentedOptions({
  options,
  value,
  onChange,
  itemMinWidth,
}: {
  options: Option[];
  value: string | null;
  onChange: (v: string) => void;
  itemMinWidth?: number;
}) {
  return (
    <View style={styles.optionsRow}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.optionItem,
              itemMinWidth ? { minWidth: itemMinWidth } : null,
            ]}
            hitSlop={6}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSel]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Survey1Screen() {
  const [meals, setMeals] = useState<string | null>(null);
  const [foodType, setFoodType] = useState<string | null>(null);
  const [snackFreq, setSnackFreq] = useState<string | null>(null);
  const [caffeine, setCaffeine] = useState<string | null>(null);

  const canNext = useMemo(() => {
    return !!(meals && foodType && snackFreq && caffeine);
  }, [meals, foodType, snackFreq, caffeine]);

  const onNext = () => {
    // TODO: 저장/다음 페이지
    // router.push("/survey/survey2");
    router.push("/"); // 임시
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* ✅ 내용만 스크롤 */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        </View>

        {/* 1) 메인 타이틀 (16) */}
        <Text style={styles.t1}>나의 건강 시그널 확인하고 싶다면?</Text>

        {/* 2) 서브 문구 (10) */}
        <Text style={styles.t2}>회원가입을 축하드립니다!</Text>

        {/* 3) 섹션 타이틀 (15) */}
        <Text style={styles.t3}>당신의 식습관에 대해 알려주세요</Text>

        {/* ✅ 설문 그룹들: 간격을 더 크게 */}
        <View style={styles.group}>
          <Text style={styles.q11}>
            하루 평균 식사 횟수 <Text style={styles.req}>*</Text>
          </Text>
          <SegmentedOptions
            options={[
              { label: "0회", value: "0" },
              { label: "1~2회", value: "1-2" },
              { label: "2~3회", value: "2-3" },
              { label: "3~4회", value: "3-4" },
              { label: "4~5회", value: "4-5" },
            ]}
            value={meals}
            onChange={setMeals}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.q11}>
            자주 먹는 음식 유형 <Text style={styles.req}>*</Text>
          </Text>
          <SegmentedOptions
            options={[
              { label: "탄수화물 위주", value: "carb" },
              { label: "단백질 위주", value: "protein" },
              { label: "가공식품 위주", value: "processed" },
              { label: "채식", value: "vegan" },
            ]}
            value={foodType}
            onChange={setFoodType}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.q11}>
            단 음식 섭취 빈도 <Text style={styles.req}>*</Text>
          </Text>
          <SegmentedOptions
            options={[
              { label: "주 0회", value: "0" },
              { label: "주 1~2회", value: "1-2" },
              { label: "주 3~4회", value: "3-4" },
              { label: "주 5~6회", value: "5-6" },
              { label: "매일", value: "daily" },
            ]}
            value={snackFreq}
            onChange={setSnackFreq}
          />
        </View>

        <View style={styles.group}>
          <Text style={styles.q11}>
            카페인 섭취 <Text style={styles.req}>*</Text>
          </Text>
          <SegmentedOptions
            options={[
              { label: "예", value: "yes" },
              { label: "아니오", value: "no" },
            ]}
            value={caffeine}
            onChange={setCaffeine}
            itemMinWidth={56}
          />
        </View>

        {/* ✅ 하단 버튼 영역이 가리지 않게 여백 추가 */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ✅ 버튼은 스크롤 밖에: 화면 맨 아래 고정 */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={onNext}
          disabled={!canNext}
          style={[styles.nextBtn, !canNext && { opacity: 0.4 }]}
        >
          <Text style={styles.nextText}>다음</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const SCREEN_W = Dimensions.get("window").width;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  headerRow: { height: 32, justifyContent: "center" },
  backBtn: { width: 40, height: 32, justifyContent: "center" },
  backText: { fontSize: 22, color: "#000", lineHeight: 22 },

  // 글자 크기
  t1: { fontSize: 16, fontWeight: "700", color: "#000", marginTop: 4 },
  t2: { fontSize: 10, fontWeight: "500", color: "#000", marginTop: 4 },
  t3: { fontSize: 15, fontWeight: "500", color: "#333", marginTop: 22, marginBottom: 6 },

  q11: { fontSize: 11, fontWeight: "600", color: "#000", marginBottom: 10 },
  req: { color: "#D32F2F", fontWeight: "700" },

  /**
   * ✅ 여기서 설문 사이 간격 키움
   * 두번째 사진처럼 더 띄우려면 38~48 정도가 예뻐
   */
  group: {
    marginTop: 42,
  },

  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  optionItem: { paddingVertical: 6, alignItems: "center", justifyContent: "center", flex: 1 },

  optionText: { fontSize: 13, fontWeight: "500", color: "#000" },
  optionTextSel: { fontWeight: "800", textDecorationLine: "underline" },

  /**
   * ✅ 하단 버튼 고정 영역
   * safe-area 고려 + 살짝 위로 띄운 느낌
   */
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
  },

  // 버튼: 343 x 51
  nextBtn: {
    width: Math.min(343, SCREEN_W - 40),
    height: 51,
    borderRadius: 14,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  // 버튼 글자 크기 12
  nextText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
});
