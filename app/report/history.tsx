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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  getWeeklyReportHistory,
  type WeeklyReportItem,
} from "../api/insights";
import { getMyProfile } from "../api/users";
import { getSignupProfile } from "../utils/profileStorage";
import Colors from "../../constants/Colors";

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}.${String(day).padStart(2, "0")}`;
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [
  undefined,
  CURRENT_YEAR,
  CURRENT_YEAR - 1,
  CURRENT_YEAR - 2,
];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

export default function ReportHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<WeeklyReportItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [userName, setUserName] = useState("유저");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchReports(0);
  }, [selectedYear, selectedMonth]);

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

  const fetchReports = async (pageNum: number) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      const data = await getWeeklyReportHistory({
        year: selectedYear,
        month: selectedMonth,
        page: pageNum,
        size: 20,
      });
      setReports((prev) =>
        pageNum === 0 ? data.items || [] : [...prev, ...(data.items || [])]
      );
      setPage(pageNum);
      setHasMore(data.hasNext ?? false);
    } catch (err) {
      console.error("Failed to fetch report history:", err);
      setError("보고서 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const goBack = () => router.back();

  const handleReportPress = (reportId: number) => {
    router.push({
      pathname: "/report/[id]",
      params: { id: reportId },
    });
  };

  const handleYearSelect = (year?: number) => {
    setSelectedYear(year);
    setSelectedMonth(undefined);
  };

  const handleMonthSelect = (month?: number) => {
    setSelectedMonth(month);
  };

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

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#111" />
          </Pressable>
        </View>
        <View style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ fontSize: 16, color: "#666" }}>{error}</Text>
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
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 타이틀 */}
        <Text style={styles.title}>
          {userName}님의{"\n"}
          <Text style={styles.titleAccent}>지난 혈당 보고서</Text>
          입니다!
        </Text>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>연도</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {YEAR_OPTIONS.map((yearOption) => {
              const isActive = selectedYear === yearOption;
              return (
                <Pressable
                  key={yearOption ?? "all-year"}
                  onPress={() => handleYearSelect(yearOption)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {yearOption ? `${yearOption}년` : "전체"}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.filterLabel, { marginTop: 12 }]}>월</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <Pressable
              onPress={() => handleMonthSelect(undefined)}
              style={[
                styles.filterChip,
                selectedMonth == null && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedMonth == null && styles.filterChipTextActive,
                ]}
              >
                전체
              </Text>
            </Pressable>
            {MONTH_OPTIONS.map((monthOption) => {
              const isActive = selectedMonth === monthOption;
              return (
                <Pressable
                  key={monthOption}
                  onPress={() => handleMonthSelect(monthOption)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {monthOption}월
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 주간 선택 리스트 */}
        <View style={styles.listWrap}>
          <Text style={styles.sectionLabel}>주간 보고서</Text>
          <View style={styles.weekList}>
            {reports.length > 0 ? (
              reports.map((report) => (
                <Pressable
                  key={report.reportId}
                  onPress={() => handleReportPress(report.reportId)}
                  style={({ pressed }) => [
                    styles.weekItem,
                    pressed && { opacity: 0.95 },
                  ]}
                >
                  <LinearGradient
                    colors={[Colors.light.mutedBackground, Colors.light.background]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.weekTopBar}
                  />
                  <View style={styles.weekItemContent}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.weekTitle}>
                        {report.weekLabel}{" "}
                        <Text style={styles.weekRange}>
                          ({formatDate(report.startDate)} ~ {formatDate(report.endDate)})
                        </Text>
                      </Text>
                      <View style={styles.weekMiniRow}>
                        <Text style={styles.miniLabel}>혈당기록</Text>
                        <Text style={styles.miniValueBlue}>{report.bloodSugarRecordDays}</Text>
                        <Text style={styles.miniUnit}>회</Text>
                        <View style={styles.dot} />
                        <Text style={styles.miniLabel}>혈압기록</Text>
                        <Text style={styles.miniValueBlue}>{report.bloodPressureRecordDays}</Text>
                        <Text style={styles.miniUnit}>회</Text>
                      </View>
                      <View style={{ marginTop: 4 }}>
                        <Text style={styles.scoreText}>
                          점수: <Text style={{ fontWeight: "700" }}>{report.overallScore}</Text>
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.light.primaryStrong} />
                  </View>
                </Pressable>
              ))
            ) : (
              <Text style={{ textAlign: "center", marginVertical: 20, color: "#999" }}>
                보고서가 없습니다.
              </Text>
            )}
          </View>

          {/* 페이지네이션 */}
          {reports.length > 0 && hasMore && (
            <Pressable
              style={styles.loadMoreBtn}
              onPress={() => fetchReports(page + 1)}
              disabled={loadingMore}
            >
              <Text style={styles.loadMoreText}>
                {loadingMore ? "불러오는 중..." : "더 보기"}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background },
  header: { height: 54, justifyContent: "center", paddingHorizontal: 14 },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  scroll: { paddingHorizontal: 18, paddingBottom: 18 },
  title: { marginTop: 14, fontSize: 20, fontWeight: "700", color: Colors.light.text, lineHeight: 28 },
  titleAccent: { color: Colors.light.primary, fontWeight: "700" },
  filterSection: {
    marginTop: 50,
  },
  filterLabel: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "0D0D0D",
  },
  filterRow: {
    gap: 8,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor:"#262626",
    borderColor: "#F2F2F2",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.subtleText,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  sectionLabel: { marginTop: 18, marginBottom: 10, fontSize: 13, fontWeight: "600", color: "#0D0D0D" },
  listWrap: { marginTop: 10 },
  weekList: { gap: 10 },
  weekItem: {
    width: 349,
    alignSelf: "center",
    backgroundColor: Colors.light.card,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.light.ink,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  weekTopBar: { width: "100%", height: 28 },
  weekItemContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  weekTitle: { fontSize: 14, fontWeight: "600", color: Colors.light.text },
  weekRange: { fontSize: 12, fontWeight: "400", color: Colors.light.subtleText },
  weekMiniRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniLabel: { fontSize: 11, fontWeight: "500", color: Colors.light.subtleText },
  miniValueBlue: { fontSize: 12, fontWeight: "600", color: Colors.light.primaryStrong },
  miniUnit: { fontSize: 11, fontWeight: "400", color: Colors.light.subtleText },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.light.border, marginHorizontal: 2 },
  scoreText: { fontSize: 12, fontWeight: "500", color: Colors.light.subtleText },
  loadMoreBtn: {
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.light.mutedBackground,
  },
  loadMoreText: { fontSize: 13, fontWeight: "600", color: Colors.light.text },
});
