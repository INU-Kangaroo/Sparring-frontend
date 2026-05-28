import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";

import HomeFab from "../../components/HomeButton";
import PressureInput from "../../components/PressureInput";
import InfoModal from "../../components/InfoModal";
import BackButton from "@/components/BackButton";
import HorizonLine from "@/components/HorizonLine";

import {
  createBloodPressureLog,
  getBloodPressureDaily,
} from "../api/bloodPressure";

const pad2 = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toHm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const formatTime = (d: Date) => toHm(d);

const screenWidth = Dimensions.get("window").width;

type BloodPressureUI = {
  systolic: number;
  diastolic: number;
  measuredAt: Date;
  measurementLabel: string;
};

function normalizeDaily(raw: any): BloodPressureUI[] {
  const arr = Array.isArray(raw)
    ? raw
    : raw?.logs ?? raw?.data ?? raw?.items ?? [];

  return arr
    .map((it: any) => ({
      systolic: Number(it?.systolic),
      diastolic: Number(it?.diastolic),
      measuredAt: new Date(it?.measuredAt),
      measurementLabel: it?.measurementLabel ?? "",
    }))
    .filter((v: any) => v && v.systolic);
}

export default function BloodPressureScreen() {
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const selectedYmd = useMemo(() => toYmd(date), [date]);

  const [records, setRecords] = useState<BloodPressureUI[]>([]);
  const [inputVisible, setInputVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const [chartWidth, setChartWidth] = useState(screenWidth - 36);

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const raw = await getBloodPressureDaily(selectedYmd);
      const list = normalizeDaily(raw).sort(
        (a, b) => a.measuredAt.getTime() - b.measuredAt.getTime()
      );
      setRecords(list);
    } catch {
      Alert.alert("불러오기 실패");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, [selectedYmd]);

  const chart = useMemo(() => {
    const labels = records.map((r) => formatTime(r.measuredAt));
    const sys = records.map((r) => r.systolic);
    const dia = records.map((r) => r.diastolic);

    return {
      labels: labels.length ? labels : ["-"],
      sys: sys.length ? sys : [0],
      dia: dia.length ? dia : [0],
    };
  }, [records]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <BackButton onPress={() => router.replace("/main/main")} />
        <Text style={styles.headerTitle}>기록하기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* 날짜 */}
        <View style={styles.dateRow}>
          <Pressable onPress={() => setShowDatePicker(!showDatePicker)}>
            <LinearGradient
              colors={["#0d0d0dec", "#262626"]}
              style={styles.datePill}
            >
              <Ionicons name="calendar" size={14} color="#fff" />
              <Text style={styles.dateText}>{selectedYmd}</Text>
            </LinearGradient>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "compact" : "default"}
              onChange={(e, d) => {
                if (d) setDate(d);

                // 안드로이드에서 선택 동시에 마무리 
                // if (Platform.OS === "android") {
                //   setShowDatePicker(false);
                // }
              }}
            />
          )}
        </View>

        {/* 혈압  */}
        <Text style={styles.sectionTitle}>혈압</Text>

        {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

        <View style={{ marginTop: 10 }}>
          {!loading && records.length === 0 ? (
            <Text style={styles.emptyText}>
              아직 기록이 없어요. 아래 버튼으로 추가해보세요!
            </Text>
          ) : (
            records.map((r, idx) => (
              <View key={idx}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>
                      {r.measurementLabel || "혈압"}
                    </Text>

                    {/* 삭제 */}
                    <Pressable
                      onPress={() => {
                        Alert.alert("삭제", "삭제하시겠습니까?", [
                          { text: "취소", style: "cancel" },
                          {
                            text: "삭제",
                            onPress: () => {
                              setRecords((prev) =>
                                prev.filter((_, i) => i !== idx)
                              );
                            },
                          },
                        ]);
                      }}
                    >
                      <Ionicons name="close" size={18} color="#999" />
                    </Pressable>
                  </View>

                  <Text style={styles.cardSub}>
                    ⏰ {formatTime(r.measuredAt)} · {r.systolic}/{r.diastolic} mmHg
                  </Text>
                </View>

                {idx !== records.length - 1 && <HorizonLine />}
              </View>
            ))
          )}
        </View>

        {/* 추가 버튼 */}
        <Pressable
          style={styles.addButton}
          onPress={() => setInputVisible(true)}
        >
          <Text style={styles.addButtonText}>+ 혈압 추가</Text>
        </Pressable>

        {/* 정보 버튼 */}
        <View style={styles.btnRow}>
          <Pressable
            style={styles.darkBtn}
            onPress={() => {
              setModalTitle("혈압 측정 방법");
              setModalContent( "1. 편안히 5분 간 휴식을 취합니다.\n\n2. 커프를 심장 높이에 위치해둡니다.\n\n3. 측정 중 말, 움직임 등을 금지합니다.\n\n4. 같은 시간대에 반복 측정합니다." );
              setModalVisible(true);
            }}
          >
            <Text style={styles.darkBtnText}>혈압 측정 방법</Text>
          </Pressable>

          <Pressable
            style={styles.darkBtn}
            onPress={() => {
              setModalTitle("정상 혈압 수치");
              setModalContent( "✔ 정상: 수축기 < 120, 이완기 < 80\n\n✔ 경계성 고혈압: 수축기 120~129, 이완기 < 80\n\n✔ 1차 고혈압: 수축기 130~139 || 이완기 80~89\n\n✔ 2차 고혈압: 수축기 ≥ 140 || 이완기 ≥ 90" );
              setModalVisible(true);
            }}
          >
            <Text style={styles.darkBtnText}>혈압 정상 수치</Text>
          </Pressable>
        </View>

        {/* 그래프 */}
        <LineChart
          data={{
            labels: chart.labels,
            datasets: [
              { data: chart.sys, color: () => "#D99197" },
              { data: chart.dia, color: () => "#262626" },
            ],
            legend: ["수축기", "이완기"],
          }}
          width={chartWidth}
          height={220}
          fromZero
          yAxisInterval={1}
          segments={2} // y축 칸 개수 
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={true}
          withHorizontalLines={true}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: () => "#333",
          }}
        />
      </ScrollView>

      <HomeFab onPress={() => router.push("/main/main")} />

      {/* 입력 */}
      <PressureInput
        visible={inputVisible}
        onClose={() => setInputVisible(false)}
        onSubmit={async (s, d, measuredAt) => {
          try {
            setSaving(true);

            await createBloodPressureLog({
              systolic: s,
              diastolic: d,
              measurementDate: toYmd(date),
              measurementTime: toHm(measuredAt),
              measurementLabel: "혈압",
            });

            setInputVisible(false);
            fetchDaily();
          } catch {
            Alert.alert("저장 실패");
          } finally {
            setSaving(false);
          }
        }}
      />

      <InfoModal
        visible={modalVisible}
        title={modalTitle}
        content={modalContent}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },

  headerTitle: { fontWeight: "800", fontSize: 16 },

  container: { padding: 18, paddingBottom: 120 },

  dateRow: { flexDirection: "row", marginBottom: 14 },

  datePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 18,
  },

  dateText: { color: "#fff", fontWeight: "800" },

  sectionTitle: {
    marginLeft: 4,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },

  emptyText: { color: "#777", marginLeft: 4, fontSize: 12 },

  card: {
    backgroundColor: "#F7F7F7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardTitle: { fontWeight: "700" },

  cardSub: { marginTop: 6, color: "#777" },

  addButton: {
    marginTop: 20,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#D99197",
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },

  btnRow: { flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 20 },

  darkBtn: {
    flex: 1,
    backgroundColor: "#262626",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  darkBtnText: { color: "#fff" },
});