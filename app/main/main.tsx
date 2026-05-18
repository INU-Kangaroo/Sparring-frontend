import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import SidebarMenu from "@/components/Sidebar";

import {
  getHome,
  convertChartData,
  type HomeResponse,
} from "../api/home";

import { syncStepsFromHealthKit } from "../api/steps";

const SCREEN_W = Dimensions.get("window").width;

export default function MainScreen() {
  const router = useRouter();

  const [home, setHome] = useState<HomeResponse | null>(null);

  const [chart, setChart] = useState({
    labels: [],
    glucose: [],
  });

  const [openSidebar, setOpenSidebar] = useState<(() => void) | null>(null);

  const handleExposeOpen = useCallback((openFn: () => void) => {
    setOpenSidebar(() => openFn);
  }, []);


  const chartWidth = useMemo(() => SCREEN_W - 60, []);

  /* ---------------- API ---------------- */

useEffect(() => {
  (async () => {
    try {
      console.log("걸음수 sync 시작");
      await syncStepsFromHealthKit();
      console.log("걸음수 sync 완료");

      const data = await getHome();
      setHome(data);

      const converted = convertChartData(data.bloodSugarChart);
      setChart(converted);
    } catch (e) {
      console.log("걸음수 sync 실패", e);
    }
  })();
}, []);

  if (!home) return null;

  return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        
      
        <View style={styles.header}>
          <Pressable onPress={() => openSidebar?.()}>
            <Ionicons name="menu" size={24} color="#091441" />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.container}>
        
        <SidebarMenu exposeOpen={handleExposeOpen} />
        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>
                {home.profileCard.name}님
              </Text>
              <Text style={styles.date}>
                {home.profileCard.displayDate}
              </Text>
            </View>

            {home.profileCard.profileImageUrl ? (
              <Image
                source={{ uri: home.profileCard.profileImageUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatar} />
            )}
          </View>

          <View style={styles.tagRow}>
            {home.profileCard.tags.slice(0, 4).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 오늘의 한마디 */}
        <Text style={styles.section}>오늘의 한마디</Text>
        <View style={styles.card}>
          <View style={styles.messageRow}>
            <View style={styles.messageAccent} />
            <Text style={styles.messageText}>
              {home.todayInsight.message}
            </Text>
          </View>
        </View>

        {/* 차트 */}
        <Text style={styles.section}>혈당 그래프</Text>
        <View style={styles.card}>
          {chart.glucose.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#888" }}>
              데이터 없음
            </Text>
          ) : (
            <LineChart
              data={{
                labels: chart.labels,
                datasets: [
                  {
                    data: chart.glucose,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={chartWidth}
              height={220}
              withDots={true}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false} // 👉 세로선 제거 (핵심)
              yAxisInterval={1}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",

                decimalPlaces: 0,

                color: () => "#222", // 라인 색
                labelColor: () => "#999",

                propsForDots: {
                  r: "3",
                  strokeWidth: "1",
                  stroke: "#222",
                },

                propsForBackgroundLines: {
                  stroke: "#EAEAEA", // 👉 연한 그리드
                  strokeWidth: 1,
                },
              }}
              style={{
                marginLeft: -10, // 👉 좌측 여백 보정
              }}
              bezier
            />
          )}
        </View>

        {/* 기록하기 */}
        <Text style={styles.section}>기록하기</Text>

        <View style={styles.recordRow}>
          <Pressable
            style={styles.recordBtn}
            onPress={() => router.push("/record/bloodSugar")}
          >
            <View style={styles.recordIconWrap}>
              <Ionicons name="water" size={20} color="#fff" />
            </View>
            <Text style={styles.recordText}>혈당</Text>
          </Pressable>

          <Pressable
            style={styles.recordBtn}
            onPress={() => router.push("/record/bloodPressure")}
          >
            <View style={styles.recordIconWrap}>
              <Ionicons name="pulse-outline" size={20} color="#fff" />
            </View>
            <Text style={styles.recordText}>혈압</Text>
          </Pressable>
        </View>

        {/* 걸음수 */}
        <Text style={styles.section}>오늘의 걸음</Text>
        <View style={styles.card}>
          <Text style={styles.stepsValue}>
            {home.steps.totalSteps.toLocaleString()} 걸음
          </Text>

          <Text style={styles.stepsSub}>
            걷기를 통한 혈당 관리 함께해요
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  container: { padding: 20 },

  profileCard: {
    backgroundColor: "#2B2B2B",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: { color: "#fff", fontSize: 20, fontWeight: "800" },
  date: { color: "#ccc", marginTop: 4 },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
  },

  tagRow: {
    flexDirection: "row",
    marginTop: 12,
    flexWrap: "wrap",
  },

  tag: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 6,
  },

  tagText: { fontSize: 12 },

  section: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

card: {
  backgroundColor: "#fff",
  borderColor: "#EAEAEA",
  borderWidth: 1,
  borderRadius: 16,
  paddingVertical: 20, 
  paddingHorizontal: 10,
  marginBottom: 20,
},

  messageRow: {
    flexDirection: "row",
  },

  messageAccent: {
    width: 3,
    height: 24,
    backgroundColor: "#222",
    marginRight: 10,
  },

  messageText: {
    flex: 1,
  },

  recordRow: {
    flexDirection: "row",
    gap: 28,
  },

  recordBtn: {
    flex: 1,
    height: 86,
    borderRadius: 12,
    backgroundColor: "#D99197",
    padding: 16,
    justifyContent: "space-between",
    marginBottom: 15,
  },

  recordIconWrap: {},

  recordText: {
    alignSelf: "flex-end",
    color: "#fff",
    fontWeight: "800",
  },

  stepsValue: {
    fontSize: 28,
    fontWeight: "800",
  },

  stepsSub: {
    marginTop: 6,
    color: "#888",
  },
});
