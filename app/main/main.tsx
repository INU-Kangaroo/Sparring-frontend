// app/main/main.tsx
import React, { useEffect, useMemo, useState } from "react";
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

  const [insight, setInsight] = useState<{ title: string; body: string }>({
    title: "오늘의 한마디",
    body: "불러오는 중...",
  });

  const [quick, setQuick] = useState<{ today: string; week: string; avg: string }>({
    today: "오늘: -",
    week: "이번 주: -",
    avg: "혈당 평균: -",
  });

  const [chart, setChart] = useState<{
    labels: string[];
    glucose: number[];
    systolic: number[];
    diastolic: number[];
    emojis?: string[];
  }>({
    labels: ["월", "화", "수", "목", "금", "토", "일"],
    glucose: [0, 0, 0, 0, 0, 0, 0],
    systolic: [0, 0, 0, 0, 0, 0, 0],
    diastolic: [0, 0, 0, 0, 0, 0, 0],
    emojis: ["—", "—", "—", "—", "—", "—", "—"],
  });

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [loadingC, setLoadingC] = useState(false);

  /** A) 오늘의 한마디 */
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingA(true);
      try {
        const data = await getTodayInsight();

        const title = data?.title ?? "오늘의 한마디";
        const body =
          data?.content ??
          data?.message ??
          data?.body ??
          "오늘의 인사이트를 불러왔어요.";

        if (!alive) return;
        setInsight({ title, body });
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

  /** C) 빠른 통계 */
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingC(true);
      try {
        const data = await getQuickStats();

        // 문자열 형태
        if (data?.todayText || data?.weekText || data?.avgText) {
          if (!alive) return;
          setQuick({
            today: data.todayText ?? "오늘: -",
            week: data.weekText ?? "이번 주: -",
            avg: data.avgText ?? "혈당 평균: -",
          });
          return;
        }

        // 숫자 형태
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
        setQuick({ today: todayText, week: weekText, avg: avgText });
      } catch (e) {
        if (__DEV__ && alive) {
          setQuick({
            today: "오늘: 혈당 2회 | 혈압 1회 (DEV 더미)",
            week: "이번 주: 혈당 12회 | 혈압 6회 (DEV 더미)",
            avg: "혈당 평균: 118 mg/dL (DEV 더미)",
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

  /** B) 차트 */
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

        const glucose = Array.isArray(data?.glucose) ? data.glucose : labels.map(() => 0);
        const systolic = Array.isArray(data?.systolic) ? data.systolic : labels.map(() => 0);
        const diastolic = Array.isArray(data?.diastolic) ? data.diastolic : labels.map(() => 0);

        if (!alive) return;
        setChart({
          labels,
          glucose,
          systolic,
          diastolic,
          emojis: data?.emojis,
        });
      } catch (e) {
        if (__DEV__ && alive) {
          if (period === "week") {
            setChart({
              labels: ["월", "화", "수", "목", "금", "토", "일"],
              glucose: [112, 118, 121, 109, 115, 111, 114],
              systolic: [122, 126, 120, 129, 124, 121, 123],
              diastolic: [79, 82, 78, 85, 80, 79, 81],
              emojis: ["🙂", "🙂", "😅", "🙂", "🙂", "—", "🙂"],
            });
          } else if (period === "month") {
            setChart({
              labels: ["1주", "2주", "3주", "4주", "5주"],
              glucose: [120, 116, 118, 114, 117],
              systolic: [126, 124, 123, 121, 122],
              diastolic: [82, 81, 80, 79, 80],
            });
          } else {
            setChart({
              labels: ["전체"],
              glucose: [117],
              systolic: [123],
              diastolic: [80],
            });
          }
        }
      } finally {
        if (alive) setLoadingB(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [period]);

  const chartWidth = useMemo(() => Math.min(343, SCREEN_W - 40), []);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>변화 차트</Text>
        <Pressable onPress={() => openSidebar?.()} hitSlop={10}>
          <Ionicons name="menu" size={24} color="#111" />
        </Pressable>
      </View>

      <SidebarMenu exposeOpen={(open) => setOpenSidebar(() => open)} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* A */}
        <View style={styles.todayCard}>
          <Text style={styles.todayTitle}>💡 {insight.title}</Text>
          <Text style={styles.todayBody}>{insight.body}</Text>

          <Pressable
            style={styles.todayMore}
            onPress={() => router.push("/main/main" as any)}
            hitSlop={8}
          >
            <Text style={styles.todayMoreText}>
              {loadingA ? "불러오는 중..." : "자세히 보기 ›"}
            </Text>
          </Pressable>
        </View>

        {/* B */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>변화 차트</Text>

            <View style={styles.tabRow}>
              <Pressable onPress={() => setPeriod("week")} style={[styles.tab, period === "week" && styles.tabSel]}>
                <Text style={[styles.tabText, period === "week" && styles.tabTextSel]}>주간</Text>
              </Pressable>

              <Pressable onPress={() => setPeriod("month")} style={[styles.tab, period === "month" && styles.tabSel]}>
                <Text style={[styles.tabText, period === "month" && styles.tabTextSel]}>월간</Text>
              </Pressable>

              <Pressable onPress={() => setPeriod("all")} style={[styles.tab, period === "all" && styles.tabSel]}>
                <Text style={[styles.tabText, period === "all" && styles.tabTextSel]}>전체</Text>
              </Pressable>
            </View>
          </View>

          <LineChart
            data={{
              labels: chart.labels,
              datasets: [
                { data: chart.glucose, color: () => "rgba(60,60,60,1)", strokeWidth: 2 },
                { data: chart.systolic, color: () => "rgba(220,38,38,1)", strokeWidth: 2 },
                { data: chart.diastolic, color: () => "rgba(37,99,235,1)", strokeWidth: 2 },
              ],
              legend: ["혈당", "수축기", "이완기"],
            }}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              propsForDots: { r: "3", strokeWidth: "2", stroke: "#fff" },
            }}
            style={styles.chart}
          />

          {period === "week" && (
            <View style={styles.emojiRow}>
              {["월", "화", "수", "목", "금", "토", "일"].map((d, idx) => (
                <View key={d} style={styles.emojiItem}>
                  <Text style={styles.emojiDay}>{d}</Text>
                  <Text style={styles.emoji}>{chart.emojis?.[idx] ? chart.emojis[idx] : "—"}</Text>
                </View>
              ))}
            </View>
          )}

          {loadingB && <Text style={styles.loadingHint}>차트 불러오는 중...</Text>}
        </View>

        {/* C */}
        <View style={styles.quickRow}>
          <Pressable style={styles.quickBtn} onPress={() => router.push("/record/bloodPressure" as any)}>
            <Text style={styles.quickBtnText}>혈압 기록하기</Text>
          </Pressable>

          <Pressable style={styles.quickBtn} onPress={() => router.push("/record/bloodSugar" as any)}>
            <Text style={styles.quickBtnText}>혈당 기록하기</Text>
          </Pressable>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 빠른 통계</Text>
          <Text style={styles.statsLine}>{quick.today}</Text>
          <Text style={styles.statsLine}>{quick.week}</Text>
          <Text style={styles.statsLineStrong}>{quick.avg}</Text>
          {loadingC && <Text style={styles.loadingHint}>통계 불러오는 중...</Text>}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111" },

  container: { paddingHorizontal: 20, paddingBottom: 24 },

  todayCard: { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 14 },
  todayTitle: { fontSize: 14, fontWeight: "800", color: "#111", marginBottom: 10 },
  todayBody: { fontSize: 13, lineHeight: 18, color: "#333" },
  todayMore: { marginTop: 10, alignSelf: "flex-start" },
  todayMoreText: { fontSize: 12, fontWeight: "700", color: "#3C3C3C" },

  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 14 },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#111" },

  tabRow: { flexDirection: "row", gap: 8 },
  tab: { height: 30, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#EFEFEF", alignItems: "center", justifyContent: "center" },
  tabSel: { backgroundColor: "#3C3C3C" },
  tabText: { fontSize: 12, fontWeight: "700", color: "#666" },
  tabTextSel: { color: "#fff" },

  chart: { borderRadius: 16, marginTop: 4 },

  emojiRow: { marginTop: 12, flexDirection: "row", justifyContent: "space-between" },
  emojiItem: { alignItems: "center", width: (SCREEN_W - 40 - 20) / 7 },
  emojiDay: { fontSize: 11, color: "#666", fontWeight: "700", marginBottom: 4 },
  emoji: { fontSize: 16 },

  quickRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  quickBtn: { flex: 1, height: 48, borderRadius: 14, backgroundColor: "#3C3C3C", alignItems: "center", justifyContent: "center" },
  quickBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  statsCard: { backgroundColor: "#fff", borderRadius: 18, padding: 16 },
  statsTitle: { fontSize: 14, fontWeight: "800", color: "#111", marginBottom: 8 },
  statsLine: { fontSize: 13, color: "#333", marginTop: 4 },
  statsLineStrong: { fontSize: 13, color: "#111", marginTop: 6, fontWeight: "800" },

  loadingHint: { marginTop: 8, fontSize: 12, color: "#999" },
});