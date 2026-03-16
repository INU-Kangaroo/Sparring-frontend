import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

import SidebarMenu from "../../components/Sidebar";
import {
  getTodayInsight,
  getQuickStats,
  getHomeChart,
  type Period,
} from "../api/home";

const SCREEN_W = Dimensions.get("window").width;

export default function MainScreen() {
  const router = useRouter();

  const [openSidebar, setOpenSidebar] = useState<(() => void) | null>(null);
  const [period, setPeriod] = useState<Period>("week");

  const [insight, setInsight] = useState({
    title: "오늘의 한마디",
    body: "불러오는 중...",
  });

  const [quick, setQuick] = useState({
    today: "오늘: -",
    week: "이번 주: -",
    avg: "혈당 평균: -",
  });

  const [chart, setChart] = useState({
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    glucose: [0, 0, 0, 0, 0, 0, 0],
    systolic: [0, 0, 0, 0, 0, 0, 0],
    diastolic: [0, 0, 0, 0, 0, 0, 0],
    emojis: ["—", "—", "—", "—", "—", "—", "—"],
  });

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [loadingC, setLoadingC] = useState(false);

  const handleExposeOpen = useCallback((openFn: () => void) => {
    setOpenSidebar(() => openFn);
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingA(true);
      try {
        const data = await getTodayInsight();

        if (!alive) return;

        setInsight({
          title: "오늘의 한마디",
          body: data?.message ?? "오늘의 인사이트를 불러왔어요.",
        });
      } catch (e) {
        if (__DEV__ && alive) {
          setInsight({
            title: "오늘의 한마디",
            body: "공복 혈당이 안정적이에요! 잘하고 있어요 👏 (DEV 더미)",
          });
        }
      } finally {
        if (alive) setLoadingA(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingC(true);
      try {
        const data = await getQuickStats();

        if (data?.todayText || data?.weekText || data?.avgText) {
          if (!alive) return;

          setQuick({
            today: data.todayText ?? "오늘: -",
            week: data.weekText ?? "이번 주: -",
            avg: data.avgText ?? "혈당 평균: -",
          });

          return;
        }

        const todayText =
          data?.todayGlucoseCount != null || data?.todayBpCount != null
            ? `오늘: 혈당 ${data.todayGlucoseCount ?? 0}회 | 혈압 ${data.todayBpCount ?? 0}회`
            : "오늘: -";

        const weekText =
          data?.weekGlucoseCount != null || data?.weekBpCount != null
            ? `이번 주: 혈당 ${data.weekGlucoseCount ?? 0}회 | 혈압 ${data.weekBpCount ?? 0}회`
            : "이번 주: -";

        const avgText =
          data?.weekGlucoseAvg != null
            ? `혈당 평균: ${Math.round(data.weekGlucoseAvg)} mg/dL`
            : "혈당 평균: -";

        if (!alive) return;

        setQuick({
          today: todayText,
          week: weekText,
          avg: avgText,
        });
      } catch (e) {
        if (__DEV__ && alive) {
          setQuick({
            today: "오늘: 혈당 2회 | 혈압 1회 (DEV)",
            week: "이번 주: 혈당 12회 | 혈압 6회 (DEV)",
            avg: "혈당 평균: 118 mg/dL (DEV)",
          });
        }
      } finally {
        if (alive) setLoadingC(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingB(true);
      try {
        const data = await getHomeChart(period);

        const labels =
          data?.labels ??
          (period === "week"
            ? ["월", "화", "수", "목", "금", "토", "일"]
            : period === "month"
            ? ["1주", "2주", "3주", "4주", "5주"]
            : ["전체"]);

        const glucose = Array.isArray(data?.glucose)
          ? data.glucose
          : labels.map(() => 0);

        const systolic = Array.isArray(data?.systolic)
          ? data.systolic
          : labels.map(() => 0);

        const diastolic = Array.isArray(data?.diastolic)
          ? data.diastolic
          : labels.map(() => 0);

        if (!alive) return;

        setChart({
          labels,
          glucose,
          systolic,
          diastolic,
          emojis: Array.isArray(data?.emojis)
            ? data.emojis
            : labels.map(() => "—"),
        });
      } catch (e) {
        if (__DEV__ && alive) {
          setChart({
            labels: ["월", "화", "수", "목", "금", "토", "일"],
            glucose: [112, 118, 121, 109, 115, 111, 114],
            systolic: [122, 126, 120, 129, 124, 121, 123],
            diastolic: [79, 82, 78, 85, 80, 79, 81],
            emojis: ["🙂", "🙂", "😅", "🙂", "🙂", "—", "🙂"],
          });
        }
      } finally {
        if (alive) setLoadingB(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [period]);

  const chartWidth = useMemo(() => Math.min(343, SCREEN_W - 80), []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => openSidebar?.()}>
          <Ionicons name="menu" size={24} color="#091441"  />
        </Pressable>
      </View>

      <SidebarMenu exposeOpen={handleExposeOpen} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.todayCard}>
          <Text style={styles.todayTitle}>💡 {insight.title}</Text>
          <Text style={styles.todayBody}>{insight.body}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>📌 변화 차트</Text>

            <View style={styles.tabRow}>
              {["week", "month", "all"].map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPeriod(p as Period)}
                  style={[styles.tab, period === p && styles.tabSel]}
                >
                  <Text style={[styles.tabText, period === p && styles.tabTextSel]}>
                    {p === "week" ? "주간" : p === "month" ? "월간" : "전체"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <LineChart
            data={{
              labels: chart.labels,
              datasets: [
                { data: chart.glucose, color: () => "#3C3C3C" },
                { data: chart.systolic, color: () => "#dc2626" },
                { data: chart.diastolic, color: () => "#2563eb" },
              ],
              legend: ["혈당", "수축기", "이완기"],
            }}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: () => "#000",
              labelColor: () => "#000",
            }}
            bezier
            style={styles.chart}
          />

          {loadingB && (
            <Text style={styles.loadingHint}>차트 불러오는 중...</Text>
          )}
        </View>

        <View style={styles.quickRow}>
          <Pressable
            style={styles.quickBtn}
            onPress={() => router.push("/record/bloodPressure")}
          >
            <Text style={styles.quickBtnText}>혈압 기록하기</Text>
          </Pressable>

          <Pressable
            style={styles.quickBtn}
            onPress={() => router.push("/record/bloodSugar")}
          >
            <Text style={styles.quickBtnText}>혈당 기록하기</Text>
          </Pressable>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 빠른 통계</Text>
          <Text style={styles.statsLine}>{quick.today}</Text>
          <Text style={styles.statsLine}>{quick.week}</Text>
          <Text style={styles.statsLineStrong}>{quick.avg}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 16,
    paddingHorizontal: 20,
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    marginTop: 20,
  },

  todayCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
  },

  todayTitle: {
    fontWeight: "800",
    marginBottom: 10,
  },

  todayBody: {
    fontSize: 13,
    lineHeight: 18,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginTop: 20,
  },

  cardTitle: {
    fontWeight: "800",
    marginBottom: 12,
  },

  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tabRow: {
    flexDirection: "row",
    gap: 8,
  },

  tab: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 14,
    backgroundColor: "#eee",
    justifyContent: "center",
  },

  tabSel: {
    backgroundColor: "#091441",
  },

  tabText: {
    fontSize: 12,
  },

  tabTextSel: {
    color: "#fff",
  },

  chart: {
    borderRadius: 16,
    marginTop: 10,
  },

  quickRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  quickBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#091441",
    justifyContent: "center",
    alignItems: "center",
  },

  quickBtnText: {
    color: "#fff",
    fontWeight: "800",
  },

  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },

  statsTitle: {
    fontWeight: "800",
    marginBottom: 8,
  },

  statsLine: {
    marginTop: 4,
  },

  statsLineStrong: {
    fontWeight: "800",
    marginTop: 6,
  },

  loadingHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
  },
});