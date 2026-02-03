// app/report/history.tsx
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type WeeklyReport = {
  id: string;
  weekLabel: string; // 예: "1월 4주"
  rangeText: string; // 예: "01.22 ~ 01.28"
  recordDaysNum: string;
  fastingNum: string;
  afterMealNum: string;
  summaryTitle: string;
  summaryText: string;
};

export default function ReportHistoryScreen() {
  const userName = "OOO";

  // ✅ 더미 주간 보고서 (최신이 위)
  const reports: WeeklyReport[] = useMemo(
    () => [
      {
        id: "w4",
        weekLabel: "2월 1주",
        rangeText: "02.03 ~ 02.09",
        recordDaysNum: "7",
        fastingNum: "102",
        afterMealNum: "138",
        summaryTitle: "건강관리 상태 ~~",
        summaryText:
          "이번 주는 식후 혈당이 조금 높게 나왔어요. 단 음식/야식 빈도를 줄이고, 식사 후 10~15분 산책을 해보면 도움이 됩니다!",
      },
      {
        id: "w3",
        weekLabel: "1월 5주",
        rangeText: "01.27 ~ 02.02",
        recordDaysNum: "7",
        fastingNum: "96",
        afterMealNum: "126",
        summaryTitle: "컨디션 좋음",
        summaryText:
          "식전/식후 모두 안정적으로 유지되고 있어요. 지금 루틴(식사 시간/수면/가벼운 활동)을 그대로 이어가면 좋아요.",
      },
      {
        id: "w2",
        weekLabel: "1월 4주",
        rangeText: "01.20 ~ 01.26",
        recordDaysNum: "7",
        fastingNum: "108",
        afterMealNum: "142",
        summaryTitle: "주의가 필요해요",
        summaryText:
          "식후 수치가 자주 튀는 편이에요. 탄수화물 양을 살짝 줄이고(밥/면), 단백질·채소를 먼저 먹는 순서로 바꿔보세요.",
      },
      {
        id: "w1",
        weekLabel: "1월 3주",
        rangeText: "01.13 ~ 01.19",
        recordDaysNum: "7",
        fastingNum: "99",
        afterMealNum: "131",
        summaryTitle: "무난한 흐름",
        summaryText:
          "전반적으로 큰 변동 없이 무난해요. 다만 간식이 늘어나는 날엔 식후가 올라갈 수 있으니 간식 타이밍만 점검해봐요.",
      },
    ],
    []
  );

  const [selectedId, setSelectedId] = useState(reports[0]?.id);
  const selected = useMemo(
    () => reports.find((r) => r.id === selectedId) ?? reports[0],
    [reports, selectedId]
  );

  const goBack = () => router.back();

  return (
    <SafeAreaView style={styles.safe}>
      {/* 상단 뒤로가기 */}
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 타이틀 */}
        <Text style={styles.title}>
          {userName}님의{"\n"}
          <Text style={styles.titleAccent}>지난 혈당 보고서</Text>
          입니다!
        </Text>

        {/* 주간 선택 리스트 */}
        <View style={styles.listWrap}>
          <Text style={styles.sectionLabel}>주간 보고서</Text>

          <View style={styles.weekList}>
            {reports.map((r) => {
              const active = r.id === selectedId;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setSelectedId(r.id)}
                  style={({ pressed }) => [
                    styles.weekItem,
                    active && styles.weekItemActive,
                    pressed && { opacity: 0.95 },
                  ]}
                >
                  {/* 위쪽 탭 느낌 그라데이션 */}
                  <LinearGradient
                    colors={active ? ["#E8E8E8", "#F2F2F2"] : ["#EEEEEE", "#F6F6F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.weekTopBar}
                  />

                  <View style={styles.weekItemContent}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.weekTitle}>
                        {r.weekLabel}{" "}
                        <Text style={styles.weekRange}>({r.rangeText})</Text>
                      </Text>

                      <View style={styles.weekMiniRow}>
                        <Text style={styles.miniLabel}>식전</Text>
                        <Text style={styles.miniValueBlue}>{r.fastingNum}</Text>
                        <Text style={styles.miniUnit}>mg/dl</Text>

                        <View style={styles.dot} />

                        <Text style={styles.miniLabel}>식후</Text>
                        <Text style={styles.miniValueBlue}>{r.afterMealNum}</Text>
                        <Text style={styles.miniUnit}>mg/dl</Text>
                      </View>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={active ? "#3F7BFF" : "#AAA"}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 선택된 주간 상세 */}
        <View style={styles.detailWrap}>
          <Text style={styles.sectionLabel}>선택한 주간 상세</Text>

          {/* stats 영역 (현재 /report 화면과 같은 느낌) */}
          <View style={styles.statsWrap}>
            <LinearGradient
              colors={["#E8E8E8", "#f2f2f2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.statBarBg}
            />

            <View style={styles.statsContent}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>기록일</Text>
                <Text>
                  <Text style={styles.valueNumber}>
                    {selected?.recordDaysNum}
                  </Text>
                  <Text style={styles.valueUnit}>일</Text>
                </Text>
              </View>

              <View style={styles.statCol}>
                <Text style={styles.statLabel}>식전 혈당</Text>
                <Text>
                  <Text style={styles.valueNumber}>{selected?.fastingNum}</Text>
                  <Text style={styles.valueUnit}>mg/dl</Text>
                </Text>
              </View>

              <View style={styles.statCol}>
                <Text style={styles.statLabel}>식후 혈당</Text>
                <Text>
                  <Text style={styles.valueNumber}>{selected?.afterMealNum}</Text>
                  <Text style={styles.valueUnit}>mg/dl</Text>
                </Text>
              </View>
            </View>

            <View style={styles.statsDivider} />
          </View>

          {/* 클립보드 카드 영역 */}
          <View style={styles.clipboardWrap}>
            <Image
              source={require("../../assets/images/subtract.png")}
              style={styles.clipTop}
              resizeMode="contain"
            />

            <View style={styles.paper}>
              <Text style={styles.paperTitle}>{selected?.summaryTitle}</Text>
              <Text style={styles.paperBody}>{selected?.summaryText}</Text>
            </View>
          </View>

          {/* 아래 버튼: 현재 보고서로 돌아가기(원하면 제거 가능) */}
          <Pressable
            onPress={() => router.push("/report")}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.btnText}>이번 주 보고서로 돌아가기</Text>
          </Pressable>
        </View>

        <View style={{ height: 26 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },

  header: {
    height: 54,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  /* 타이틀 */
  title: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    lineHeight: 28,
  },
  titleAccent: {
    color: "#3F7BFF",
    fontWeight: "700",
  },

  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },

  /* 주간 리스트 */
  listWrap: {
    marginTop: 10,
  },
  weekList: {
    gap: 10,
  },
  weekItem: {
    width: 349,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  weekItemActive: {
    borderColor: "#D8E4FF",
  },
  weekTopBar: {
    width: "100%",
    height: 28,
  },
  weekItemContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  weekRange: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
  },

  weekMiniRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  miniLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#777",
    marginRight: 6,
  },
  miniValueBlue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#3F7BFF",
  },
  miniUnit: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#111",
    marginLeft: 2,
    marginRight: 10,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D0D0D0",
    marginHorizontal: 6,
  },

  /* 상세 영역 */
  detailWrap: {
    marginTop: 18,
  },

  /* stats 영역 (report 페이지 느낌 재사용) */
  statsWrap: {
    width: 349,
    alignSelf: "center",
    marginTop: 6,
  },
  statBarBg: {
    width: 349,
    height: 32,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  statsContent: {
    width: 349,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    paddingTop: 10,
  },
  statCol: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#777",
  },
  valueNumber: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#3F7BFF",
  },
  valueUnit: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  statsDivider: {
    width: 349,
    height: 1,
    backgroundColor: "#E6E6E6",
    marginTop: 12,
  },

  /* 클립보드 */
  clipboardWrap: {
    marginTop: 22,
    alignItems: "center",
  },
  clipTop: {
    width: 180,
    height: 60,
    marginBottom: -10,
    zIndex: 2,
  },
  paper: {
    width: 254,
    minHeight: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  paperTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  paperBody: {
    fontSize: 12.5,
    fontWeight: "400",
    color: "#666",
    lineHeight: 18,
  },

  /* 버튼 */
  btn: {
    marginTop: 26,
    alignSelf: "center",
    width: 214,
    height: 44,
    borderRadius: 28,
    backgroundColor: "#3B3B3B",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
