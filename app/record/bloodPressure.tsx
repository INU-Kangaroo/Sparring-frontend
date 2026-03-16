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

import HomeFab from "../../components/HomeButton";
import RecordBox from "../../components/RecordBox";
import PressureInput from "../../components/PressureInput";
import InfoModal from "../../components/InfoModal";
import BackButton from "@/components/BackButton";

import {
  createBloodPressureLog,
  getBloodPressureDaily,
} from "../api/bloodPressure";

// ----------------- date utils -----------------
const pad2 = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toHm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const formatTime = (d: Date) => toHm(d);
// ---------------------------------------------

type BloodPressureUI = {
  systolic: number;
  diastolic: number;
  heartRate?: number;
  measuredAt: Date;
  measurementLabel: string;
};

function normalizeDaily(raw: any): BloodPressureUI[] {
  const arr = Array.isArray(raw) ? raw : raw?.logs ?? raw?.data ?? raw?.items ?? [];
  if (!Array.isArray(arr)) return [];

  return arr
    .map((it: any) => {
      const measuredAtStr =
        it?.measuredAt ?? it?.measured_at ?? it?.timestamp ?? it?.createdAt;
      if (!measuredAtStr) return null;

      return {
        systolic: Number(it?.systolic),
        diastolic: Number(it?.diastolic),
        heartRate: it?.heartRate != null ? Number(it.heartRate) : undefined,
        measuredAt: new Date(measuredAtStr),
        measurementLabel: String(it?.measurementLabel ?? it?.label ?? ""),
      } as BloodPressureUI;
    })
    .filter(Boolean) as BloodPressureUI[];
}

// ----- stats helpers -----
const mean = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;

const stdev = (xs: number[]) => {
  if (xs.length <= 1) return 0;
  const m = mean(xs);
  const v = xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
};

const round1 = (n: number) => Math.round(n * 10) / 10;
// -------------------------

export default function BloodPressureScreen() {
  const router = useRouter();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const selectedYmd = useMemo(() => toYmd(date), [date]);

  const [morningBP, setMorningBP] = useState<BloodPressureUI | null>(null);
  const [nightBP, setNightBP] = useState<BloodPressureUI | null>(null);
  const [allRecords, setAllRecords] = useState<BloodPressureUI[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [inputVisible, setInputVisible] = useState(false);
  const [editing, setEditing] = useState<"morning" | "night">("morning");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const [chartWidth, setChartWidth] = useState<number>(
    Dimensions.get("window").width - 40
  );

  const isMorningLabel = (label?: string) =>
    !!label &&
    (label.includes("아침") ||
      label.includes("기상") ||
      label.toLowerCase().includes("morning"));

  const isNightLabel = (label?: string) =>
    !!label &&
    (label.includes("취침") ||
      label.includes("밤") ||
      label.includes("저녁") ||
      label.toLowerCase().includes("night") ||
      label.toLowerCase().includes("evening"));

  const pickMorningNight = (records: BloodPressureUI[]) => {
    const sorted = [...records].sort(
      (a, b) => a.measuredAt.getTime() - b.measuredAt.getTime()
    );

    const labeledMorning =
      sorted.find((r) => isMorningLabel(r.measurementLabel)) ?? null;
    const labeledNight =
      sorted.find((r) => isNightLabel(r.measurementLabel)) ?? null;

    // 라벨이 있으면 그것만 사용
    if (labeledMorning || labeledNight) {
      return {
        morning: labeledMorning,
        night: labeledNight,
      };
    }

    // 라벨이 전혀 없는 레거시 데이터 대응
    // 시간대로만 분리하고, 하나의 기록을 morning/night 둘 다에 넣지 않음
    const morningCandidates = sorted.filter((r) => r.measuredAt.getHours() < 12);
    const nightCandidates = sorted.filter((r) => r.measuredAt.getHours() >= 18);

    const morning =
      morningCandidates.length > 0 ? morningCandidates[0] : null;
    const night =
      nightCandidates.length > 0
        ? nightCandidates[nightCandidates.length - 1]
        : null;

    return { morning, night };
  };

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const raw = await getBloodPressureDaily(selectedYmd);
      const records = normalizeDaily(raw).sort(
        (a, b) => a.measuredAt.getTime() - b.measuredAt.getTime()
      );

      setAllRecords(records);

      const { morning, night } = pickMorningNight(records);
      setMorningBP(morning);
      setNightBP(night);
    } catch (e: any) {
      console.log("BP fetchDaily error", e?.response?.status, e?.response?.data ?? e);
      Alert.alert("불러오기 실패", e?.message ?? "혈압 기록 조회 실패");
      setAllRecords([]);
      setMorningBP(null);
      setNightBP(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYmd]);

  const inputTitle = editing === "morning" ? "아침 혈압 입력" : "취침 전 혈압 입력";

  const initialValue = useMemo<[number, number] | undefined>(() => {
    const bp = editing === "morning" ? morningBP : nightBP;
    return bp ? [bp.systolic, bp.diastolic] : undefined;
  }, [editing, morningBP, nightBP]);

  const initialMeasuredAt = useMemo<Date | undefined>(() => {
    const bp = editing === "morning" ? morningBP : nightBP;
    return bp?.measuredAt;
  }, [editing, morningBP, nightBP]);

  const chart = useMemo(() => {
    const labels = allRecords.map((r) => formatTime(r.measuredAt));
    const sys = allRecords.map((r) => r.systolic);
    const dia = allRecords.map((r) => r.diastolic);

    const maxLabels = 6;
    if (labels.length > maxLabels) {
      const step = Math.ceil(labels.length / maxLabels);
      const thinned = labels.map((t, i) => (i % step === 0 ? t : ""));
      return {
        labels: thinned,
        sys: sys.length ? sys : [0],
        dia: dia.length ? dia : [0],
      };
    }

    return {
      labels: labels.length ? labels : ["-"],
      sys: sys.length ? sys : [0],
      dia: dia.length ? dia : [0],
    };
  }, [allRecords]);

  const summary = useMemo(() => {
    const sys = allRecords.map((r) => r.systolic);
    const dia = allRecords.map((r) => r.diastolic);

    const sysAvg = sys.length ? round1(mean(sys)) : 0;
    const diaAvg = dia.length ? round1(mean(dia)) : 0;

    const sysMin = sys.length ? Math.min(...sys) : 0;
    const diaMin = dia.length ? Math.min(...dia) : 0;

    const sysMax = sys.length ? Math.max(...sys) : 0;
    const diaMax = dia.length ? Math.max(...dia) : 0;

    const sysSd = sys.length ? round1(stdev(sys)) : 0;
    const diaSd = dia.length ? round1(stdev(dia)) : 0;

    return {
      sys: { avg: sysAvg, min: sysMin, max: sysMax, sd: sysSd },
      dia: { avg: diaAvg, min: diaMin, max: diaMax, sd: diaSd },
    };
  }, [allRecords]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <BackButton onPress={() => router.replace("/main/main")} />
        <Text style={styles.headerTitle}>기록하기</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Date row */}
        <View style={styles.dateRow}>
          <Pressable
            style={styles.datePill}
            onPress={() => setShowDatePicker((prev) => !prev)}
          >
            <Ionicons name="calendar" size={14} color="#fff" />
            <Text style={styles.dateText}>{selectedYmd}</Text>
          </Pressable>

          {showDatePicker && (
            <View style={styles.datePickerInline}>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "compact" : "default"}
                onChange={(event, selected) => {
                  if ((event as any)?.type === "dismissed") {
                    setShowDatePicker(false);
                    return;
                  }

                  if (selected) {
                    setDate(selected);
                  }

                  if (Platform.OS !== "ios") {
                    setShowDatePicker(false);
                  }
                }}
              />
            </View>
          )}
        </View>

        {loading && (
          <View style={{ marginTop: 10 }}>
            <ActivityIndicator />
          </View>
        )}

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.sectionTitle}>아침 혈압</Text>
            <RecordBox
              title=""
              time={morningBP ? formatTime(morningBP.measuredAt) : undefined}
              value={
                morningBP
                  ? `${morningBP.systolic}/${morningBP.diastolic}`
                  : undefined
              }
              valueIcon="heart"
              onPress={() => {
                setEditing("morning");
                setInputVisible(true);
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>취침 전 혈압</Text>
            <RecordBox
              title=""
              time={nightBP ? formatTime(nightBP.measuredAt) : undefined}
              value={
                nightBP
                  ? `${nightBP.systolic}/${nightBP.diastolic}`
                  : undefined
              }
              onPress={() => {
                setEditing("night");
                setInputVisible(true);
              }}
            />
          </View>
        </View>

        <View style={styles.btnRow}>
          <Pressable
            style={styles.darkBtn}
            onPress={() => {
              setModalTitle("혈압 측정 방법");
              setModalContent(
                "1. 편안히 5분 간 휴식을 취합니다.\n\n2. 커프를 심장 높이에 위치해둡니다.\n\n3. 측정 중 말, 움직임 등을 금지합니다.\n\n4. 같은 시간대에 반복 측정합니다."
              );
              setModalVisible(true);
            }}
          >
            <Text style={styles.darkBtnText}>혈압 측정 방법</Text>
          </Pressable>

          <Pressable
            style={styles.darkBtn}
            onPress={() => {
              setModalTitle("혈압 정상 수치");
              setModalContent(
                "✔ 정상: 수축기 < 120, 이완기 < 80\n\n✔ 경계성 고혈압: 수축기 120~129, 이완기 < 80\n\n✔ 1차 고혈압: 수축기 130~139 또는 이완기 80~89\n\n✔ 2차 고혈압: 수축기 ≥ 140 또는 이완기 ≥ 90"
              );
              setModalVisible(true);
            }}
          >
            <Text style={styles.darkBtnText}>혈압 정상 수치</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeaderRow}>
            <Text style={[styles.summaryHead, { width: 52 }]} />
            <Text style={styles.summaryHead}>평균</Text>
            <Text style={styles.summaryHead}>최저</Text>
            <Text style={styles.summaryHead}>최고</Text>
            <Text style={styles.summaryHead}>StdDev</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { width: 52 }]}>수축기</Text>
            <Text style={styles.summaryCell}>{summary.sys.avg}</Text>
            <Text style={styles.summaryCell}>{summary.sys.min}</Text>
            <Text style={styles.summaryCell}>{summary.sys.max}</Text>
            <Text style={styles.summaryCell}>{summary.sys.sd}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { width: 52 }]}>이완기</Text>
            <Text style={styles.summaryCell}>{summary.dia.avg}</Text>
            <Text style={styles.summaryCell}>{summary.dia.min}</Text>
            <Text style={styles.summaryCell}>{summary.dia.max}</Text>
            <Text style={styles.summaryCell}>{summary.dia.sd}</Text>
          </View>

          <Text style={styles.summaryHint}>* 당일 기록 기준 요약 (단위: mmHg)</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHead}>
            <Text style={styles.cardTitle}>혈압 추세</Text>
            <Text style={styles.smallText}>단위: mmHg</Text>
          </View>

          <View
            style={styles.chartWrap}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w && Math.abs(w - chartWidth) > 1) setChartWidth(w);
            }}
          >
            <LineChart
              data={{
                labels: chart.labels,
                datasets: [
                  { data: chart.sys, color: () => "#d30c0c" },
                  { data: chart.dia, color: () => "#2b6cb0" },
                ],
                legend: ["수축기", "이완기"],
              }}
              width={chartWidth}
              height={180}
              fromZero
              withInnerLines
              withOuterLines={false}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: () => "#3C3C3C",
                labelColor: () => "#666",
                propsForDots: { r: "3" },
              }}
              style={{ borderRadius: 14 }}
            />
          </View>
        </View>
      </ScrollView>

      <HomeFab onPress={() => router.push("/main/main")} />

      <PressureInput
        visible={inputVisible}
        title={inputTitle}
        initialValue={initialValue}
        initialMeasuredAt={initialMeasuredAt}
        onClose={() => setInputVisible(false)}
        onSubmit={async (s, d, measuredAt) => {
          try {
            setSaving(true);

            const measurementDate = toYmd(date);
            const measurementTime = toHm(measuredAt);
            const measurementLabel = editing === "morning" ? "아침" : "취침 전";

            const res = await createBloodPressureLog({
              systolic: s,
              diastolic: d,
              measurementDate,
              measurementTime,
              measurementLabel,
            });

            console.log("bp save res", res);

            const merged = new Date(date);
            merged.setHours(measuredAt.getHours(), measuredAt.getMinutes(), 0, 0);

            const optimistic: BloodPressureUI = {
              systolic: s,
              diastolic: d,
              measuredAt: merged,
              measurementLabel,
            };

            if (editing === "morning") {
              setMorningBP(optimistic);
            } else {
              setNightBP(optimistic);
            }

            setInputVisible(false);
            await fetchDaily();
          } catch (e: any) {
            console.log("bp save error", e?.response?.status, e?.response?.data ?? e);
            Alert.alert("저장 실패", e?.message ?? "저장 실패");
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

      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.savingText}>저장 중...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    height: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerTitle: { fontWeight: "800", fontSize: 16 },

  container: { padding: 18, paddingBottom: 120 },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    zIndex: 10,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 18,
    backgroundColor: "#091441",
  },
  dateText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  datePickerInline: {
    marginLeft: 8,
    justifyContent: "center",
  },

  row: { flexDirection: "row", marginBottom: 12 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#222",
    marginBottom: 6,
  },

  btnRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  darkBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#091441",
    alignItems: "center",
    justifyContent: "center",
  },
  darkBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#1435b9f6",
  },
  summaryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  summaryHead: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "900",
    color: "#333",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#F5F7FF",
    marginBottom: 6,
  },
  summaryLabel: {
    marginLeft: 11,
    fontSize: 11,
    fontWeight: "900",
    color: "#333",
  },
  summaryCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    color: "#333",
  },
  summaryHint: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#777",
  },

  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  chartHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 13, fontWeight: "900", color: "#111" },
  smallText: { fontSize: 11, fontWeight: "700", color: "#777" },

  chartWrap: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },

  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  savingText: {
    marginTop: 10,
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});