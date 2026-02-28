import React from "react";
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

import ScoreCard from "./Scorecard";
import WeeklySummary from "./Weeklysummary";
import WarningsList from "./Warningslist";

export default function ReportScreen() {
  const userName = "OOO";
  const recordDaysNum = "7";
  const fastingNum = "102";
  const afterMealNum = "138";
  const summaryTitle = "건강관리 상태 ~~";
  const summaryText =
    "두바이초콜릿쿠키 같은 고칼로리 음식 섭취를 줄여야 합니다. 하지만 맛있는거 압니다.. 그래도 줄여야 혈당도 낮추고 내 맘도 그래요!!";

  // ── ScoreCard 데이터 ──────────────────────────────────────
  const scoreData = {
    totalScore: 75,
    comment: "잘하고 있어요! 조금만 더",
    items: [
      { label: "혈당 관리", score: 80, color: "#4CAF50" },
      { label: "측정 꾸준함", score: 70, color: "#FFC107" },
      { label: "패턴 안정성", score: 85, color: "#4CAF50" },
    ],
  };

  // ── WeeklySummary 데이터 ──────────────────────────────────
  const weeklyData = {
    totalMeasured: 18,
    totalPossible: 21,
    avgGlucose: 125,
    normalCount: 12,
    normalTotal: 18,
    dayData: [
      { day: "월", emoji: "😊", count: 3 },
      { day: "화", emoji: "😊", count: 3 },
      { day: "수", emoji: "😐", count: 2 },
      { day: "목", emoji: "😐", count: 3 },
      { day: "금", emoji: "😊", count: 3 },
      { day: "토", emoji: "😐", count: 2 },
      { day: "일", emoji: "😐", count: 2 },
    ],
  };

  // ── WarningsList 데이터 ───────────────────────────────────
  const warningsData = [
    {
      id: "1",
      icon: "⚡",
      problem: "점심 식후 혈당",
      detail: "10번 중 7번 높음\n평균: 165 (목표: 140)",
      dayDetails: "월 170, 화 165, 목 180 🔴",
      tips: ["밥 양 20% 줄이기", "현미밥으로 변경", "식후 15분 걷기"],
    },
  ];

  const goBack = () => router.back();
  const goPastReports = () => router.push("/report/history");
  const goHome = () => router.push("/main/main");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 타이틀 */}
        <Text style={styles.title}>
          {userName}님의{"\n"}
          <Text style={styles.titleAccent}>이번 주 혈당 분석</Text> 결과입니다!
        </Text>

        {/* stats */}
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
                <Text style={styles.valueNumber}>{recordDaysNum}</Text>
                <Text style={styles.valueUnit}>일</Text>
              </Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>식전 혈당</Text>
              <Text>
                <Text style={styles.valueNumber}>{fastingNum}</Text>
                <Text style={styles.valueUnit}>mg/dl</Text>
              </Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>식후 혈당</Text>
              <Text>
                <Text style={styles.valueNumber}>{afterMealNum}</Text>
                <Text style={styles.valueUnit}>mg/dl</Text>
              </Text>
            </View>
          </View>
          <View style={styles.statsDivider} />
        </View>

        {/* 클립보드 카드 */}
        <View style={styles.clipboardWrap}>
          <Image
            source={require("../../assets/images/subtract.png")}
            style={styles.clipTop}
            resizeMode="contain"
          />
          <View style={styles.paper}>
            <Text style={styles.paperTitle}>{summaryTitle}</Text>
            <Text style={styles.paperBody}>{summaryText}</Text>
          </View>
        </View>

        {/* ── 3개 컴포넌트 ── */}
        <ScoreCard
          totalScore={scoreData.totalScore}
          comment={scoreData.comment}
          items={scoreData.items}
        />

        <WeeklySummary
          totalMeasured={weeklyData.totalMeasured}
          totalPossible={weeklyData.totalPossible}
          avgGlucose={weeklyData.avgGlucose}
          normalCount={weeklyData.normalCount}
          normalTotal={weeklyData.normalTotal}
          dayData={weeklyData.dayData}
        />

        <WarningsList items={warningsData} />

        {/* 지난 보고서 버튼 */}
        <Pressable
          onPress={goPastReports}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.btnText}>지난 보고서 보러가기</Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 홈 버튼 */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F6F6" },

  header: { height: 54, justifyContent: "center", paddingHorizontal: 14 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },

  scrollContent: { paddingHorizontal: 18, paddingBottom: 40 },

  title: { marginTop: 14, fontSize: 20, fontWeight: "700", color: "#111", lineHeight: 28 },
  titleAccent: { color: "#3F7BFF", fontWeight: "700" },

  statsWrap: { width: 349, alignSelf: "center", marginTop: 18 },
  statBarBg: {
    width: 349,
    height: 32,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  statsContent: {
    width: 349,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    paddingTop: 10,
  },
  statCol: { alignItems: "center" },
  statLabel: { fontSize: 13, fontWeight: "500", color: "#777" },
  valueNumber: { marginTop: 6, fontSize: 15, fontWeight: "600", color: "#3F7BFF" },
  valueUnit: { fontSize: 15, fontWeight: "600", color: "#111" },
  statsDivider: { width: 349, height: 1, backgroundColor: "#E6E6E6", marginTop: 12 },

  clipboardWrap: { marginTop: 22, alignItems: "center" },
  clipTop: { width: 180, height: 60, marginBottom: -10, zIndex: 2 },
  paper: {
    width: 254,
    minHeight: 160,
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
  paperTitle: { fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 10 },
  paperBody: { fontSize: 12.5, fontWeight: "400", color: "#666", lineHeight: 18 },

  btn: {
    marginTop: 32,
    alignSelf: "center",
    width: 214,
    height: 44,
    borderRadius: 28,
    backgroundColor: "#3B3B3B",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },

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