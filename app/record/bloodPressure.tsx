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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-chart-kit";

import HomeFab from "../../components/HomeButton";
import RecordBox from "../../components/RecordBox";
import PressureInput from "../../components/PressureInput";
import InfoModal from "../../components/InfoModal";

const screenWidth = Dimensions.get("window").width;

type BloodPressure = {
  systolic: number;
  diastolic: number;
  measuredAt: Date; // ✅ 사용자가 선택한 측정 시간(원본)
};

const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0"
  )}`;

export default function BloodPressureScreen() {
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [morningBP, setMorningBP] = useState<BloodPressure | null>(null);
  const [nightBP, setNightBP] = useState<BloodPressure | null>(null);

  const [inputVisible, setInputVisible] = useState(false);
  const [editing, setEditing] = useState<"morning" | "night">("morning");

  // ✅ 모달에 넘길 “맥락” 상태들
  const inputTitle = editing === "morning" ? "아침 혈압 입력" : "취침 전 혈압 입력";

  const initialValue = useMemo<[number, number] | undefined>(() => {
    const bp = editing === "morning" ? morningBP : nightBP;
    return bp ? [bp.systolic, bp.diastolic] : undefined;
  }, [editing, morningBP, nightBP]);

  const initialMeasuredAt = useMemo<Date | undefined>(() => {
    const bp = editing === "morning" ? morningBP : nightBP;
    return bp?.measuredAt;
  }, [editing, morningBP, nightBP]);

  // 평균/최저/최대/표준편차 계산 (현재는 2개 값(s/d) 기준)
  const calcSummary = (bp: BloodPressure | null) => {
    if (!bp) return ["-", "-", "-", "-"] as const;
    const values = [bp.systolic, bp.diastolic];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const std = Math.sqrt(
      values.reduce((a, b) => a + (b - avg) ** 2, 0) / values.length
    );
    return [Math.round(avg), min, max, parseFloat(std.toFixed(1))] as const;
  };

  const morningSummary = calcSummary(morningBP);
  const nightSummary = calcSummary(nightBP);

  // ✅ 차트 데이터 (없으면 null로 처리 -> 0 찍히는게 싫으면 아래에서 null을 0으로 바꿔도 됨)
  const systolicData = [
    morningBP?.systolic ?? 0,
    nightBP?.systolic ?? 0,
  ];
  const diastolicData = [
    morningBP?.diastolic ?? 0,
    nightBP?.diastolic ?? 0,
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>혈압 기록</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Picker */}
        <Pressable style={styles.datePill} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={14} color="#fff" style={styles.dateIcon} />
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(_, selected) => {
              setShowDatePicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        {/* Blood Pressure Records */}
        <View style={styles.recordRow}>
          <RecordBox
            title="아침 혈압"
            time={morningBP ? formatTime(morningBP.measuredAt) : undefined}
            value={morningBP ? `${morningBP.systolic}/${morningBP.diastolic}` : undefined}
            onPress={() => {
              setEditing("morning");
              setInputVisible(true);
            }}
          />
          <RecordBox
            title="취침 전 혈압"
            time={nightBP ? formatTime(nightBP.measuredAt) : undefined}
            value={nightBP ? `${nightBP.systolic}/${nightBP.diastolic}` : undefined}
            onPress={() => {
              setEditing("night");
              setInputVisible(true);
            }}
          />
        </View>

        {/* Info Buttons */}
        <View style={styles.infoRow}>
          <Pressable
            style={styles.infoBtn}
            onPress={() => {
              setModalTitle("혈압 측정 방법");
              setModalContent(
                "1. 측정 전 5분 이상 안정을 취합니다.\n" +
                  "2. 팔을 심장 높이에 두고 커프를 착용합니다.\n" +
                  "3. 말하지 않고 움직이지 않습니다.\n" +
                  "4. 같은 시간대에 반복 측정하는 것이 좋습니다.\n" +
                  "5. 아침 혈압과 취침 전 혈압을 기록합니다."
              );
              setModalVisible(true);
            }}
          >
            <Text style={styles.infoText}>혈압 측정 방법</Text>
          </Pressable>

          <Pressable
            style={styles.infoBtn}
            onPress={() => {
              setModalTitle("혈압 정상 수치");
              setModalContent(
                "✔ 수축기 혈압 (SBP): 120 mmHg 미만\n" +
                  "✔ 이완기 혈압 (DBP): 80 mmHg 미만\n\n" +
                  "※ 수축기 140 또는 이완기 90 이상은 고혈압으로 분류"
              );
              setModalVisible(true);
            }}
          >
            <Text style={styles.infoText}>혈압 정상 수치</Text>
          </Pressable>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>요약</Text>
            <View style={styles.summaryCols}>
              <Text style={styles.col}>평균</Text>
              <Text style={styles.col}>최저</Text>
              <Text style={styles.col}>최대</Text>
              <Text style={styles.col}>StdDev</Text>
            </View>
          </View>
          <SummaryRow label="아침" sub="Morning" values={morningSummary} />
          <SummaryRow label="취침 전" sub="Night" values={nightSummary} />
        </View>

        {/* Blood Pressure Chart */}
        <View style={styles.chartWrap}>
          <Text style={styles.chartTitle}>혈압 통계</Text>

          <LineChart
            data={{
              labels: ["아침", "취침 전"],
              datasets: [
                {
                  data: systolicData,
                  // chart-kit은 color 함수 필요함
                  color: () => "red",
                  strokeWidth: 2,
                },
                {
                  data: diastolicData,
                  color: () => "blue",
                  strokeWidth: 2,
                },
              ],
              legend: ["수축기", "이완기"],
            }}
            width={screenWidth - 70}
            height={220}
            yAxisSuffix="mmHg"
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              style: { borderRadius: 15 },
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
            }}
            style={styles.chart}
          />
        </View>
      </ScrollView>

      <HomeFab onPress={() => router.push("/main/main")} />

      {/* ✅ Pressure Input Modal (맥락 전달 핵심) */}
      <PressureInput
        visible={inputVisible}
        title={inputTitle}
        initialValue={initialValue}
        initialMeasuredAt={initialMeasuredAt}
        onClose={() => setInputVisible(false)}
        onSubmit={(s, d, measuredAt) => {
          const record: BloodPressure = { systolic: s, diastolic: d, measuredAt };

          if (editing === "morning") setMorningBP(record);
          else setNightBP(record);

          setInputVisible(false);
        }}
      />

      {/* Info Modal */}
      <InfoModal
        visible={modalVisible}
        title={modalTitle}
        content={modalContent}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

type SummaryRowProps = {
  label: string;
  sub: string;
  values: readonly (string | number)[];
};

function SummaryRow({ label, sub, values }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <View>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summarySub}>{sub}</Text>
      </View>
      <View style={styles.summaryValues}>
        {values.map((v, i) => (
          <Text key={i} style={[styles.value, i === 2 && styles.highlight]}>
            {v}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  container: { padding: 30, backgroundColor: "#F5F5F5" },

  datePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#3C3C3C",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  dateIcon: { marginRight: 6 },
  dateText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  recordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 50,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  infoBtn: {
    width: "48%",
    height: 44,
    backgroundColor: "#3C3C3C",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  summary: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  summaryTitle: { fontWeight: "700" },
  summaryCols: { flexDirection: "row" },
  col: { fontSize: 12, color: "#777", marginRight: 20 },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  summaryLabel: { fontWeight: "700" },
  summarySub: { fontSize: 12, color: "#AAA" },
  summaryValues: { flexDirection: "row", gap: 30, marginRight: 10 },
  value: { fontSize: 14 },
  highlight: { color: "red", fontWeight: "700" },

  chartWrap: { marginTop: 24 },
  chartTitle: { fontWeight: "700", marginBottom: 8 },
  chart: { borderRadius: 16 },
});
