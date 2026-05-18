import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import ScoreCard from "./Scorecard";
import WeeklySummary from "./Weeklysummary";
import WarningsList from "./Warningslist";
import {
  getWeeklyReportDetail,
  type WeeklyReportResponse,
  type DailyCondition,
} from "../api/insights";
import {
  getReportSummaryMetrics,
  type ReportSummaryMetrics,
} from "./summaryMetrics";
import { getMyProfile } from "../api/users";
import { getSignupProfile } from "../utils/profileStorage";
import Colors from "@/constants/Colors";

const dayOfWeekToLabel = (dayOfWeek: string): string => {
  const map: Record<string, string> = {
    MON: "월",
    TUE: "화",
    WED: "수",
    THU: "목",
    FRI: "금",
    SAT: "토",
    SUN: "일",
  };
  return map[dayOfWeek] || dayOfWeek;
};

const statusToEmoji = (status: string): string => {
  const map: Record<string, string> = {
    GOOD: "😊",
    CAUTION: "😐",
    BAD: "😟",
    NO_DATA: "❓",
  };
  return map[status] || "❓";
};

const getCategoryEmoji = (category: string): string => {
  const map: Record<string, string> = {
    BLOOD_SUGAR: "🩸",
    BLOOD_PRESSURE: "❤️",
    MEAL: "🍽️",
    EXERCISE: "🚶",
    ACTIVITY: "🚶",
  };
  return map[category] || "💡";
};

const normalizeActivityCopy = (text?: string) =>
  String(text ?? "")
    .replaceAll("운동", "활동")
    .replaceAll("운동량", "활동량");

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<WeeklyReportResponse | null>(null);
  const [summaryMetrics, setSummaryMetrics] = useState<ReportSummaryMetrics | null>(null);
  const [userName, setUserName] = useState("유저");

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) {
        setError("보고서 ID가 없습니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const reportId = parseInt(id, 10);
        if (!Number.isFinite(reportId) || reportId <= 0) {
          setError("유효하지 않은 보고서 ID입니다.");
          setLoading(false);
          return;
        }
        const data = await getWeeklyReportDetail(reportId);
        setReportData(data);
        try {
          const metrics = await getReportSummaryMetrics(data.startDate, data.endDate);
          setSummaryMetrics(metrics);
        } catch (metricsError) {
          console.error("Failed to fetch report summary metrics:", metricsError);
          setSummaryMetrics(null);
        }
      } catch (err) {
        console.error("Failed to fetch report detail:", err);
        setError("보고서를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const loadUserName = async () => {
      try {
        const profile = await getMyProfile();
        if (!mounted) return;
        setUserName(profile.username?.trim() || "유저");
      } catch {
        const signupProfile = await getSignupProfile();
        if (!mounted) return;
        setUserName(signupProfile.username?.trim() || "유저");
      }
    };

    loadUserName();

    return () => {
      mounted = false;
    };
  }, []);

  const recordDaysNum = (summaryMetrics?.recordDays ?? reportData?.recordDays ?? 0).toString();
  const summaryTitle = reportData?.scoreLabel || "건강관리 상태 ~~";
  const summaryText = normalizeActivityCopy(reportData?.aiComment) || "데이터 없음";

  const scoreData = {
    totalScore: reportData?.overallScore || 0,
    comment: reportData?.scoreLabel || "잘하고 있어요! 조금만 더",
    items: [
      {
        label: "혈당 관리",
        score: reportData?.scores?.healthManagement || 0,
        color: reportData?.scores?.healthManagement! >= 70 ? "#4CAF50" : "#FFC107",
      },
      {
        label: "측정 꾸준함",
        score: reportData?.scores?.measurementConsistency || 0,
        color: reportData?.scores?.measurementConsistency! >= 70 ? "#4CAF50" : "#FFC107",
      },
      {
        label: "식사·활동",
        score: reportData?.scores?.lifestyle || 0,
        color: reportData?.scores?.lifestyle! >= 70 ? "#4CAF50" : "#FFC107",
      },
    ],
  };

  const goBack = () => router.back();
  const goPastReports = () => router.push("/report/history");

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#111" />
          </Pressable>
        </View>
        <View style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
          <ActivityIndicator size="large" color={Colors.light.primaryStrong} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !reportData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#111" />
          </Pressable>
        </View>
        <View style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ fontSize: 16, color: "#666" }}>{error || "데이터를 불러올 수 없습니다."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {userName}님의{"\n"}
          <Text style={styles.titleAccent}>혈당 분석</Text> 결과입니다!
        </Text>

        <View style={styles.statsWrap}>
          <LinearGradient
            colors={[Colors.light.mutedBackground, Colors.light.background]}
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
              <Text style={styles.statLabel}>혈당 기록</Text>
              <Text>
                <Text style={styles.valueNumber}>
                  {summaryMetrics?.bloodSugarCount ?? reportData.bloodSugarRecordDays}
                </Text>
                <Text style={styles.valueUnit}>회</Text>
              </Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>혈압 기록</Text>
              <Text>
                <Text style={styles.valueNumber}>
                  {summaryMetrics?.bloodPressureCount ?? reportData.bloodPressureRecordDays}
                </Text>
                <Text style={styles.valueUnit}>회</Text>
              </Text>
            </View>
          </View>
          <View style={styles.statsDivider} />
        </View>

        <View style={styles.clipboardWrap}>
          <View style={styles.paper}>
            <Text style={styles.paperTitle}>{summaryTitle}</Text>
            <Text style={styles.paperBody}>{summaryText}</Text>
          </View>
        </View>

        <ScoreCard
          totalScore={scoreData.totalScore}
          comment={scoreData.comment}
          items={scoreData.items}
        />

        <WeeklySummary
          totalMeasured={summaryMetrics?.totalMeasured || 0}
          totalPossible={summaryMetrics?.totalPossible || 21}
          avgGlucose={summaryMetrics?.avgGlucose || 0}
          normalCount={summaryMetrics?.normalCount || 0}
          normalTotal={summaryMetrics?.normalTotal || 0}
          activitySummary={reportData?.activitySummary}
          dayData={["월", "화", "수", "목", "금", "토", "일"].map((day, index) => ({
            day,
            emoji:
              new Map(
                (reportData?.dailyConditions || []).map((condition: DailyCondition) => [
                  dayOfWeekToLabel(condition.dayOfWeek),
                  statusToEmoji(condition.status),
                ])
              ).get(day) || "❓",
            count: summaryMetrics?.dayCounts[index] || 0,
          }))}
          highlights={(reportData?.highlights || []).map((item) => ({
            ...item,
            message: normalizeActivityCopy(item.message),
          }))}
        />

        {reportData?.improvement && (
          <WarningsList
            items={[
              {
                id: "1",
                icon: getCategoryEmoji(reportData.improvement.category),
                problem: normalizeActivityCopy(reportData.improvement.timeLabel),
                detail: normalizeActivityCopy(reportData.improvement.detail),
                dayDetails: "",
                tips: (reportData.improvement.tips || []).map(normalizeActivityCopy),
              },
            ]}
          />
        )}

        <Pressable
          onPress={goPastReports}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.btnText}>지난 보고서 보러가기</Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background },

  header: { height: 54, justifyContent: "center", paddingHorizontal: 14 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 40 },
  title: { marginTop: 14, fontSize: 20, fontWeight: "700", color: Colors.light.text, lineHeight: 28 },
  titleAccent: { color: Colors.light.primaryStrong, fontWeight: "700" },
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
  statLabel: { fontSize: 13, fontWeight: "500", color: Colors.light.subtleText },
  valueNumber: { marginTop: 6, fontSize: 15, fontWeight: "600", color: Colors.light.primaryStrong },
  valueUnit: { fontSize: 15, fontWeight: "600", color: Colors.light.text },
  statsDivider: { width: 349, height: 1, backgroundColor: Colors.light.border, marginTop: 12 },
  clipboardWrap: { marginTop: 22, alignItems: "center" },
  paper: {
    width: 254,
    minHeight: 160,
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: Colors.light.ink,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  paperTitle: { fontSize: 13, fontWeight: "600", color: Colors.light.subtleText, marginBottom: 10 },
  paperBody: { fontSize: 12.5, fontWeight: "400", color: Colors.light.subtleText, lineHeight: 18 },
  btn: {
    marginTop: 32,
    alignSelf: "center",
    width: 214,
    height: 44,
    borderRadius: 28,
    backgroundColor: "#262626",
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});